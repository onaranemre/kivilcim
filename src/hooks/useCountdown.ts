import { useCallback, useEffect, useRef, useState } from 'react'

export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/*
 * PiP penceresi ayrı bir document — sitenin CSS'ine erişemiyor. Bu yüzden
 * açılış anında geçerli temanin (açık/koyu, sistem ya da elle seçilmiş)
 * çözümlenmiş --token değerlerini <html>'den okuyup kendi :root'una
 * kopyalıyoruz; geri kalan kurallar aynı sitedeki gibi var(--token) kullanıyor.
 * Böylece saat fontu, arka plan ve buton camsı görünümü sitenin o anki
 * temasıyla birebir aynı kalıyor.
 */
const PIP_TOKENS = [
  '--bg-0',
  '--halo-1',
  '--halo-2',
  '--halo-3',
  '--text',
  '--font-display',
  '--font-mono',
  '--spark',
  '--spark-soft',
  '--paper',
  '--radius-sm',
  '--ease-out',
  '--glow-spark',
] as const

function snapshotThemeTokens(): string {
  const cs = getComputedStyle(document.documentElement)
  return PIP_TOKENS.map((name) => `${name}: ${cs.getPropertyValue(name).trim()};`).join('\n    ')
}

function buildPipCss(tokenBlock: string): string {
  return `
  :root {
    ${tokenBlock}
  }
  * { box-sizing: border-box; margin: 0; }
  html, body { height: 100%; }
  body {
    background:
      radial-gradient(120% 90% at 12% -10%, var(--halo-1), transparent 55%),
      radial-gradient(90% 80% at 100% 0%, var(--halo-2), transparent 50%),
      radial-gradient(140% 120% at 50% 120%, var(--halo-3), transparent 60%),
      var(--bg-0);
    color: var(--text);
    font-family: var(--font-mono);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px;
    text-transform: lowercase;
    user-select: none;
    -webkit-user-select: none;
  }
  .t {
    font-family: var(--font-display);
    font-size: 44px;
    font-weight: 300;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01em;
    color: var(--text);
  }
  .s {
    font-size: 10px;
    letter-spacing: 0.28em;
    color: var(--text);
    opacity: 0.7;
  }
  /* Sitedeki .btn--primary ile birebir aynı: düz dolgu turuncu, camsı değil. */
  button {
    margin-top: 4px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: lowercase;
    padding: 9px 18px;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    color: var(--paper);
    background: linear-gradient(180deg, var(--spark), var(--spark-soft));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      0 12px 28px -14px var(--glow-spark);
    transition: transform 0.18s var(--ease-out), box-shadow 0.25s ease;
  }
  button:hover {
    transform: translateY(-1px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.36),
      0 16px 36px -14px var(--glow-spark);
  }
  [hidden] { display: none; }
  `
}

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
  // Bir açma denemesi gerçekten başarısız olursa (izin/politika engeli),
  // düğmeyi bir daha göstermeyip kullanıcıyı çalışmayan bir seçenekle
  // baş başa bırakmıyoruz.
  const [pipBlocked, setPipBlocked] = useState(false)

  const endAtRef = useRef(0)
  const remainingRef = useRef(0)
  const tickRef = useRef<number | null>(null)
  const pipWinRef = useRef<Window | null>(null)

  remainingRef.current = remaining

  // Sadece özelliğin varlığını değil, gerçekten çağrılabilir olduğunu ve
  // güvenli bağlamda çalıştığını da kontrol ediyoruz — API'yi destekleyen
  // tek tarayıcı ailesi Chromium; diğerlerinde "küçült" hiç görünmemeli.
  const pipSupported =
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof window.documentPictureInPicture?.requestWindow === 'function' &&
    !pipBlocked

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
    dpip
      .requestWindow({ width: 260, height: 150 })
      .then((pip) => {
        // Fontlar (Fraunces + Space Mono), tıpkı index.html'deki gibi —
        // saat ve buton sitedekiyle aynı yazı tipini kullanabilsin.
        const link = pip.document.createElement('link')
        link.rel = 'stylesheet'
        link.href =
          'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Space+Mono:wght@400;700&display=swap'
        pip.document.head.appendChild(link)

        const style = pip.document.createElement('style')
        style.textContent = buildPipCss(snapshotThemeTokens())
        pip.document.documentElement.lang = 'tr'
        pip.document.head.appendChild(style)
        pip.document.body.innerHTML = PIP_HTML
        pip.document.title = 'kıvılcım'

        pip.document
          .getElementById('pip-toggle')
          ?.addEventListener('click', () => toggle())

        pip.addEventListener('pagehide', () => {
          pipWinRef.current = null
          setPipActive(false)
        })

        pipWinRef.current = pip
        setPipActive(true)
      })
      .catch(() => {
        // Tarayıcı PiP penceresine izin vermedi (izin politikası, kullanıcı
        // reddi vb.) — sayfa içi sayaç sürer, düğmeyi bir daha göstermeyiz.
        setPipBlocked(true)
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
