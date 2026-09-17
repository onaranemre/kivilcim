import { useEffect, useState } from 'react'

/** Verilen genişliğin altında mı? Not defterinin masaüstü yan bölme yerine
 * mobilde alttan çıkan bir sayfa olarak açılmasına karar vermek için. */
export function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= breakpoint,
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpoint])

  return isMobile
}
