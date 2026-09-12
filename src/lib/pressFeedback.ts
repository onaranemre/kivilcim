/**
 * Trackpad'de hafif "dokunarak tıklama" (tap to click) gibi çok kısa
 * basışlarda, mousedown→mouseup→click aynı karede geçebiliyor ve tarayıcı
 * :active durumunu hiç boyamadan atlayabiliyor — bu yüzden basma animasyonu
 * sadece uzunca basılı tutulunca (ya da force click ile) görünüyordu.
 *
 * Bu modül; .btn, [data-press] ve süre kaydırıcısı gibi basılabilir
 * elemanlara pointerdown anında bir [data-pressed] işaretleyici koyar ve en
 * az MIN_MS boyunca (gerçek basış ne kadar kısa olursa olsun) tutar. CSS
 * tarafında ilgili kurallar `:is(:active, [data-pressed])` şeklinde bu
 * işaretleyiciyi de dinliyor, böylece animasyon her zaman — hafif dokunuşla
 * da — tetikleniyor.
 */
const PRESSABLE = '.btn, [data-press], input[type="range"]'
const MIN_MS = 120

export function initPressFeedback(): () => void {
  let activeEl: HTMLElement | null = null
  let downAt = 0
  let releaseTimer: number | null = null

  const clear = (el: HTMLElement | null) => {
    if (el) delete el.dataset.pressed
  }

  const cancelTimer = () => {
    if (releaseTimer !== null) {
      window.clearTimeout(releaseTimer)
      releaseTimer = null
    }
  }

  const onPointerDown = (e: PointerEvent) => {
    const target = e.target as Element | null
    const el = target?.closest?.(PRESSABLE) as (HTMLElement & { disabled?: boolean }) | null
    if (!el || el.disabled) return
    cancelTimer()
    if (activeEl && activeEl !== el) clear(activeEl)
    activeEl = el
    downAt = performance.now()
    el.dataset.pressed = 'true'
  }

  const release = () => {
    if (!activeEl) return
    const el = activeEl
    const remaining = Math.max(0, MIN_MS - (performance.now() - downAt))
    cancelTimer()
    releaseTimer = window.setTimeout(() => {
      clear(el)
      if (activeEl === el) activeEl = null
      releaseTimer = null
    }, remaining)
  }

  const cancel = () => {
    cancelTimer()
    clear(activeEl)
    activeEl = null
  }

  document.addEventListener('pointerdown', onPointerDown, { passive: true })
  document.addEventListener('pointerup', release, { passive: true })
  document.addEventListener('pointercancel', cancel, { passive: true })
  window.addEventListener('blur', cancel)

  return () => {
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('pointerup', release)
    document.removeEventListener('pointercancel', cancel)
    window.removeEventListener('blur', cancel)
    cancelTimer()
  }
}
