import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

export type RollPhase = 'idle' | 'shaking' | 'settling' | 'done'

const SHAKE_MS = 780
const SETTLE_MS = 380
const TICK_MS = 55

interface RollerState {
  phase: RollPhase
  /** Sallanma sırasında artan sayaç; görsel akış için kullanılır. */
  tick: number
  isRolling: boolean
  roll: (finalize: () => void) => void
}

/**
 * Zar atma zamanlamasını yönetir: idle -> shaking -> settling -> done.
 * `finalize` sonuç kesinleştiği an (settling başında) çağrılır; sallanma
 * yalnızca görseldir.
 */
export function useRoller(onComplete?: () => void): RollerState {
  const reducedMotion = useReducedMotion()
  const [phase, setPhase] = useState<RollPhase>('idle')
  const [tick, setTick] = useState(0)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (interval.current) {
      clearInterval(interval.current)
      interval.current = null
    }
  }, [])

  useEffect(() => clearAll, [clearAll])

  const roll = useCallback(
    (finalize: () => void) => {
      clearAll()

      if (reducedMotion) {
        finalize()
        setPhase('done')
        onCompleteRef.current?.()
        return
      }

      setPhase('shaking')
      setTick((t) => t + 1)
      interval.current = setInterval(() => setTick((t) => t + 1), TICK_MS)

      timers.current.push(
        setTimeout(() => {
          if (interval.current) {
            clearInterval(interval.current)
            interval.current = null
          }
          finalize()
          setPhase('settling')
        }, SHAKE_MS),
      )

      timers.current.push(
        setTimeout(() => {
          setPhase('done')
          onCompleteRef.current?.()
        }, SHAKE_MS + SETTLE_MS),
      )
    },
    [clearAll, reducedMotion],
  )

  return {
    phase,
    tick,
    isRolling: phase === 'shaking' || phase === 'settling',
    roll,
  }
}
