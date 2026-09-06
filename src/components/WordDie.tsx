import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import type { DieMeta, WordCategoryId } from '../data/dice'
import { WORD_CATEGORIES, wordCategory } from '../data/dice'
import { sample } from '../lib/random'
import { useRoller } from '../hooks/useRoller'
import type { DieHandle, DieResult } from '../types'
import styles from './Die.module.css'

interface Props {
  meta: DieMeta
  result: DieResult | null
  category: WordCategoryId
  onCategory: (c: WordCategoryId) => void
  onCommit: (r: DieResult) => void
}

export const WordDie = forwardRef<DieHandle, Props>(function WordDie(
  { meta, result, category, onCategory, onCommit },
  ref,
) {
  const pool = wordCategory(category).words
  const { phase, tick, isRolling, roll } = useRoller()
  const [stream, setStream] = useState<string[]>(() => sample(pool, 3))

  useEffect(() => {
    if (phase === 'shaking') setStream(sample(pool, 3))
  }, [tick, phase, pool])

  const doRoll = useCallback(() => {
    roll(() => {
      const words = sample(pool, 3)
      onCommit({
        dieId: 'word',
        label: words.join(' · '),
        words,
        wordCategory: category,
      })
    })
  }, [roll, pool, category, onCommit])

  useImperativeHandle(ref, () => ({ roll: doRoll }), [doRoll])

  const showStream = phase === 'shaking'

  return (
    <article
      className={`${styles.card} ${phase === 'shaking' ? 'is-shaking' : ''} ${
        phase === 'settling' ? 'is-settling' : ''
      }`}
      data-state={phase === 'idle' && !result ? 'empty' : phase}
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

      <div className={styles.cats} role="group" aria-label="Kelime kategorisi">
        {WORD_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.cat}
            data-active={c.id === category}
            disabled={isRolling}
            onClick={() => onCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={styles.viewport} aria-live="polite">
        {showStream ? (
          <div className={styles.streamWords}>
            {stream.map((w, i) => (
              <span key={`${w}-${i}`}>{w}</span>
            ))}
          </div>
        ) : result?.words ? (
          <div className={styles.words} key={result.label}>
            {result.words.map((w, i) => (
              <span className={styles.word} key={`${w}-${i}`}>
                {w}
              </span>
            ))}
          </div>
        ) : (
          <span className={styles.placeholder}>önce kategori, sonra zar…</span>
        )}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.rollBtn}
          onClick={doRoll}
          disabled={isRolling}
        >
          {isRolling ? 'atılıyor…' : result ? 'kelimeleri yenile' : 'zarı at'}
        </button>
      </div>
    </article>
  )
})
