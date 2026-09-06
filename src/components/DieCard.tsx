import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import type { DieMeta } from '../data/dice'
import { poolFor } from '../data/dice'
import { pick, pickDifferent } from '../lib/random'
import { useRoller } from '../hooks/useRoller'
import type { DieHandle, DieResult } from '../types'
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
  const { phase, tick, isRolling, roll } = useRoller()
  const [stream, setStream] = useState(() => pick(pool))

  useEffect(() => {
    if (phase === 'shaking') setStream(pick(pool))
  }, [tick, phase, pool])

  const doRoll = useCallback(() => {
    roll(() => {
      onCommit({ dieId: meta.id, label: pickDifferent(pool, result?.label ?? null) })
    })
  }, [roll, pool, result, onCommit, meta.id])

  useImperativeHandle(ref, () => ({ roll: doRoll }), [doRoll])

  const showStream = phase === 'shaking'
  const cardState = phase === 'idle' && !result ? 'empty' : phase

  return (
    <article
      className={`${styles.card} ${phase === 'shaking' ? 'is-shaking' : ''} ${
        phase === 'settling' ? 'is-settling' : ''
      }`}
      data-state={cardState}
    >
      <div className={styles.head}>
        <span className={styles.glyph} aria-hidden>
          {meta.glyph}
        </span>
        <div className={styles.titles}>
          <span className={styles.title}>{meta.title}</span>
          <span className={styles.hint}>{meta.hint}</span>
        </div>
        <span className={styles.dot} aria-hidden />
      </div>

      <div className={styles.viewport} aria-live="polite">
        {showStream ? (
          <span className={styles.stream}>{stream}</span>
        ) : result ? (
          <span className={styles.value} key={result.label}>
            {result.label}
          </span>
        ) : (
          <span className={styles.placeholder}>zar bekliyor…</span>
        )}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.rollBtn}
          onClick={doRoll}
          disabled={isRolling}
        >
          {isRolling ? 'atılıyor…' : result ? 'yeniden at' : 'zarı at'}
        </button>
      </div>
    </article>
  )
})
