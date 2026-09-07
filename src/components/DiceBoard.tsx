import { useRef } from 'react'
import { DICE } from '../data/dice'
import type { DieId } from '../data/dice'
import type { DieHandle, DieResult, ResultMap } from '../types'
import { DieCard } from './DieCard'
import styles from './DiceBoard.module.css'

interface Props {
  results: ResultMap
  onCommit: (dieId: DieId, result: DieResult) => void
  onStart: () => void
}

export function DiceBoard({ results, onCommit, onStart }: Props) {
  const handles = useRef<Record<string, DieHandle | null>>({})
  const rolled = DICE.filter((d) => results[d.id]).length
  const allRolled = rolled === DICE.length

  const rollAll = () => {
    DICE.forEach((d, i) => {
      window.setTimeout(() => handles.current[d.id]?.roll(), i * 130)
    })
  }

  return (
    <div className={styles.board}>
      <div
        className={styles.progress}
        role="img"
        aria-label={`${rolled}/${DICE.length} zar atıldı`}
      >
        {DICE.map((d) => (
          <span key={d.id} className={styles.dot} data-on={Boolean(results[d.id])} />
        ))}
      </div>

      <div className={styles.grid}>
        {DICE.map((meta, i) => (
          <DieCard
            key={meta.id}
            ref={(h) => {
              handles.current[meta.id] = h
            }}
            meta={meta}
            result={results[meta.id]}
            /* Son kart tek başına satırı kaplıyor; içeriği ortalansın. */
            centered={i === DICE.length - 1}
            onCommit={(r) => onCommit(meta.id, r)}
          />
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className="btn btn--ghost" onClick={rollAll}>
          ⟳ hepsini at
        </button>

        {allRolled ? (
          <button type="button" className="btn btn--primary" onClick={onStart}>
            şarkıya başla →
          </button>
        ) : (
          <span className={styles.waiting}>
            {rolled}/{DICE.length} zar atıldı
          </span>
        )}
      </div>
    </div>
  )
}
