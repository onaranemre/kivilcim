import { DICE } from '../data/dice'
import type { ResultMap } from '../types'
import styles from './DiceProgress.module.css'

interface Props {
  results: ResultMap
  filledLabel: string
}

/** Zar at / kendin yaz — her iki sekmenin üstündeki ortak "kaç kategori dolu" göstergesi. */
export function DiceProgress({ results, filledLabel }: Props) {
  const filled = DICE.filter((d) => results[d.id]).length

  return (
    <div className={styles.progress} role="img" aria-label={`${filled}/${DICE.length} ${filledLabel}`}>
      {DICE.map((d) => (
        <span key={d.id} className={styles.dot} data-on={Boolean(results[d.id])} />
      ))}
    </div>
  )
}
