import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import type { DieMeta } from '../data/dice'
import { poolFor } from '../data/dice'
import { buzz, pick, pickDifferent, sample } from '../lib/random'
import { useRoller } from '../hooks/useRoller'
import type { DieHandle, DieResult } from '../types'
import { DieFace, randomFace } from './DieFace'
import styles from './Die.module.css'

interface Props {
  meta: DieMeta
  result: DieResult | null
  onCommit: (r: DieResult) => void
}

export const DieCard = forwardRef<DieHandle, Props>(function DieCard(
  { meta, result, onCommit },
  ref,
) {
  const pool = poolFor(meta.id)
  const draw = meta.draw ?? 1
  const { phase, tick, isRolling, roll } = useRoller()
  const [stream, setStream] = useState(() => drawLabel())
  const [face, setFace] = useState(() => randomFace())

  function drawLabel(): string {
    return draw > 1 ? sample(pool, draw).join(' · ') : pick(pool)
  }

  // Sallanma sürerken hem değer hem zar yüzü akar.
  useEffect(() => {
    if (phase !== 'shaking') return
    setStream(drawLabel())
    setFace((f) => randomFace(f))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, phase])

  const doRoll = useCallback(() => {
    if (isRolling) return
    buzz(10)
    roll(() => {
      buzz([0, 22, 40, 16])
      setFace((f) => randomFace(f))
      if (draw > 1) {
        const words = sample(pool, draw)
        onCommit({ dieId: meta.id, label: words.join(' · '), words })
      } else {
        onCommit({ dieId: meta.id, label: pickDifferent(pool, result?.label ?? null) })
      }
    })
  }, [isRolling, roll, pool, draw, result, onCommit, meta.id])

  useImperativeHandle(ref, () => ({ roll: doRoll }), [doRoll])

  const state = isRolling ? phase : result ? 'done' : 'empty'

  return (
    <article
      className={`${styles.card} ${phase === 'shaking' ? 'is-shaking' : ''} ${
        phase === 'settling' ? 'is-settling' : ''
      }`}
      data-state={state}
      role="button"
      tabIndex={0}
      aria-label={`${meta.title} zarını at`}
      aria-busy={isRolling}
      onClick={doRoll}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          doRoll()
        }
      }}
    >
      {phase === 'settling' && <span className={styles.ripple} aria-hidden />}

      <div className={styles.head}>
        <span
          className={`${styles.face} ${phase === 'shaking' ? styles.tumbling : ''} ${
            phase === 'settling' ? styles.landing : ''
          }`}
        >
          <DieFace face={face} />
        </span>
        <span className={styles.title}>{meta.title}</span>
        <span className={styles.reroll} aria-hidden>
          {result && !isRolling ? '↻' : ''}
        </span>
      </div>

      <div className={styles.body} aria-live="polite">
        {phase === 'shaking' ? (
          <span className={styles.stream}>{stream}</span>
        ) : result ? (
          <span className={styles.value} key={result.label}>
            {result.label}
          </span>
        ) : (
          <span className={styles.hint}>{meta.hint}</span>
        )}
      </div>
    </article>
  )
})
