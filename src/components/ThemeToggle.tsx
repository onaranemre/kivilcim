import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { EffectiveTheme } from '../hooks/useTheme'
import styles from './ThemeToggle.module.css'

interface Props {
  theme: EffectiveTheme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark'
  const ref = useRef<HTMLButtonElement>(null)

  /*
   * iOS Safari'de adres çubuğu kayarken visualViewport görsel olarak kayar,
   * position:fixed elemanlar tepede "aşağı iniyormuş" gibi görünür. Butonu
   * her karede görsel viewport'un tepesine yapıştırıyoruz.
   */
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    let raf = 0
    const sync = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = ref.current
        if (el) el.style.transform = `translate3d(0, ${vv.offsetTop}px, 0)`
      })
    }
    sync()
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('scroll', sync, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('scroll', sync)
    }
  }, [])

  // <body>'ye portal: hiçbir ata elemanın transform'u sabit konumu bozamaz.
  return createPortal(
    <button
      ref={ref}
      type="button"
      className={styles.btn}
      onClick={onToggle}
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      title={isDark ? 'Açık tema' : 'Koyu tema'}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>,
    document.body,
  )
}
