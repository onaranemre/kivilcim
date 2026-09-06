import { useCallback, useEffect, useRef, useState } from 'react'

export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const PIP_CSS = `
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: 'Space Mono', ui-monospace, Menlo, monospace;
    background: #1b1712;
    color: #efe7d7;
    height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 6px;
    user-select: none;
    -webkit-user-select: none;
  }
  .t {
    font-size: 46px; font-weight: 700; letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
    color: #f0925f;
  }
  .s {
    font-size: 10px; letter-spacing: 0.28em; text-transform: lowercase;
    color: #8a8072;
  }
  button {
    margin-top: 4px;
    font: inherit; font-size: 11px; letter-spacing: 0.1em; text-transform: lowercase;
    padding: 5px 14px; border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.18);
    background: transparent; color: #efe7d7; cursor: pointer;
  }
  button:hover { border-color: #f0925f; }
  [hidden] { display: none; }
`

const PIP_HTML = `
  <div class="t" id="pip-time">00:00</div>
  <div class="s" id="pip-state">akıyor</div>
  <button id="pip-toggle" type="button">duraklat</button>
`

export interface Countdown {
  active: boolean
  running: boolean
  done: boolean
  remaining: number
  total: number
  start: (ms: number) => void
  toggle: () => void
  reset: () => void
  stop: () => void
  pipSupported: boolean
  pipActive: boolean
  openPip: () => void
  closePip: () => void
}

export function useCountdown(): Countdown {
  const [total, setTotal] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [active, setActive] = useState(false)
  const [pipActive, setPipActive] = useState(false)

  const endAtRef = useRef(0)
  const remainingRef = useRef(0)
  const tickRef = useRef<number | null>(null)
  const pipWinRef = useRef<Window | null>(null)

  remainingRef.current = remaining

  const pipSupported =
    typeof window !== 'undefined' && 'documentPictureInPicture' in window

  const stopTick = useCallback(() => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const startTick = useCallback(() => {
    stopTick()
    tickRef.current = window.setInterval(() => {
      const left = endAtRef.current - Date.now()
      if (left <= 0) {
        setRemaining(0)
        setRunning(false)
        stopTick()
      } else {
        setRemaining(left)
      }
    }, 200)
  }, [stopTick])

  const start = useCallback(
    (ms: number) => {
      setTotal(ms)
      setRemaining(ms)
      setActive(true)
      setRunning(true)
      endAtRef.current = Date.now() + ms
      startTick()
    },
    [startTick],
  )

  const toggle = useCallback(() => {
    setRunning((r) => {
      if (r) {
        stopTick()
        setRemaining(Math.max(0, endAtRef.current - Date.now()))
        return false
      }
      if (remainingRef.current <= 0) return false
      endAtRef.current = Date.now() + remainingRef.current
      startTick()
      return true
    })
  }, [startTick, stopTick])

  const reset = useCallback(() => {
    setRunning(false)
    stopTick()
    setRemaining(total)
    endAtRef.current = Date.now() + total
  }, [total, stopTick])

  const closePip = useCallback(() => {
    pipWinRef.current?.close()
    pipWinRef.current = null
    setPipActive(false)
  }, [])

  const stop = useCallback(() => {
    setRunning(false)
    stopTick()
    setActive(false)
    setRemaining(0)
    setTotal(0)
    closePip()
  }, [stopTick, closePip])

  const openPip = useCallback(() => {
    const dpip = window.documentPictureInPicture
    if (!dpip || pipWinRef.current) return
    dpip.requestWindow({ width: 260, height: 150 }).then((pip) => {
      const style = pip.document.createElement('style')
      style.textContent = PIP_CSS
      pip.document.documentElement.lang = 'tr'
      pip.document.head.appendChild(style)
      pip.document.body.innerHTML = PIP_HTML
      pip.document.title = 'kıvılcım'

      const link = pip.document.createElement('link')
      link.rel = 'stylesheet'
      link.href =
        'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap'
      pip.document.head.appendChild(link)

      pip.document
        .getElementById('pip-toggle')
        ?.addEventListener('click', () => toggle())

      pip.addEventListener('pagehide', () => {
        pipWinRef.current = null
        setPipActive(false)
      })

      pipWinRef.current = pip
      setPipActive(true)
    }).catch(() => {
      /* tarayıcı PiP penceresine izin vermedi; sayfa içi sayaç sürer */
    })
  }, [toggle])

  const done = active && remaining <= 0

  // PiP penceresi içeriğini güncel tut
  useEffect(() => {
    const pip = pipWinRef.current
    if (!pip) return
    const t = pip.document.getElementById('pip-time')
    const s = pip.document.getElementById('pip-state')
    const b = pip.document.getElementById('pip-toggle') as HTMLElement | null
    if (t) t.textContent = fmtClock(remaining)
    if (s) s.textContent = done ? 'süre doldu' : running ? 'akıyor' : 'duraklatıldı'
    if (b) {
      b.textContent = running ? 'duraklat' : 'devam'
      b.hidden = done
    }
  }, [remaining, running, done, pipActive])

  useEffect(() => stopTick, [stopTick])

  return {
    active,
    running,
    done,
    remaining,
    total,
    start,
    toggle,
    reset,
    stop,
    pipSupported,
    pipActive,
    openPip,
    closePip,
  }
}
