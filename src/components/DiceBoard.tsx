import { useRef } from 'react'
import { DICE } from '../data/dice'
import type { DieId, WordCategoryId } from '../data/dice'
import type { DieHandle, DieResult, ResultMap } from '../types'
import { DieCard } from './DieCard'
import { WordDie } from './WordDie'
import styles from './DiceBoard.module.css'

interface Props {
  results: ResultMap
  wordCat: WordCategoryId
  onWordCat: (c: WordCategoryId) => void
  onCommit: (dieId: DieId, result: DieResult) => void
  onStart: () => void
}

export function DiceBoard({ results, wordCat, onWordCat, onCommit, onStart }: Props) {
  const handles = useRef<Record<string, DieHandle | null>>({})
  const rolledCount = DICE.filter((d) => results[d.id]).length
  const allRolled = rolledCount === DICE.length

  const rollAll = () => {
    DICE.forEach((d, i) => {
      window.setTimeout(() => handles.current[d.id]?.roll(), i * 140)
    })
  }

  return (
    <div className={styles.board}>
      <div className={styles.pills}>
        {DICE.map((d) => (
          <span key={d.id} className={styles.pill} data-filled={Boolean(results[d.id])}>
            <span className={styles.pillDot} aria-hidden />
            {d.title}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {DICE.filter((d) => d.id !== 'word').map((meta) => (
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
        <WordDie
          ref={(h) => {
            handles.current.word = h
          }}
          meta={DICE.find((d) => d.id === 'word')!}
          result={results.word}
          category={wordCat}
          onCategory={onWordCat}
          onCommit={(r) => onCommit('word', r)}
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className="btn btn--ghost" onClick={rollAll}>
          ⟳ Hepsini At
        </button>

        <div className={styles.startWrap}>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!allRolled}
            onClick={onStart}
          >
            Şarkıya Başla →
          </button>
          <span className={styles.startHint}>
            {allRolled
              ? 'beş zar da hazır'
              : `${rolledCount}/${DICE.length} zar atıldı`}
          </span>
        </div>
      </div>
    </div>
  )
}
