import { useRef } from 'react'
import type { ReactNode } from 'react'
import { DICE } from '../data/dice'
import type { DieId } from '../data/dice'
import type { DieHandle, DieResult, ResultMap } from '../types'
import { DieCard } from './DieCard'
import styles from './DiceBoard.module.css'

interface Props {
  results: ResultMap
  onCommit: (dieId: DieId, result: DieResult) => void
  onStart: () => void
  modeToggle: ReactNode
}

export function DiceBoard({ results, onCommit, onStart, modeToggle }: Props) {
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
      <div className={styles.grid}>
        {DICE.map((meta) => (
          <DieCard
            key={meta.id}
            ref={(h) => {
              handles.current[meta.id] = h
            }}
            meta={meta}
            result={results[meta.id]}
            onCommit={(r) => onCommit(meta.id, r)}
          />
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className="btn btn--ghost" onClick={rollAll}>
          ⟳ hepsini at
        </button>

        {modeToggle}

        {/* Zarlar bitmeden de yer kaplıyor (görünmez) — buton belirince
            satır uzayıp seçici kaymasın, sayfa boyu sabit kalsın. */}
        <button
          type="button"
          className="btn btn--primary"
          onClick={onStart}
          disabled={!allRolled}
          aria-hidden={!allRolled}
          tabIndex={allRolled ? undefined : -1}
          style={allRolled ? undefined : { visibility: 'hidden' }}
        >
          şarkıya başla →
        </button>
      </div>
    </div>
  )
}
