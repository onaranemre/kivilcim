import { DICE } from '../data/dice'
import type { HistoryRound } from '../hooks/useHistory'
import styles from './History.module.css'

interface Props {
  rounds: HistoryRound[]
  onReplay: (round: HistoryRound) => void
  onDelete: (id: string) => void
}

const MONTHS = [
  'oca', 'şub', 'mar', 'nis', 'may', 'haz',
  'tem', 'ağu', 'eyl', 'eki', 'kas', 'ara',
]

function relativeDate(ts: number): string {
  const now = new Date()
  const then = new Date(ts)
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOfDay(now) - startOfDay(then)) / 86_400_000)
  if (days <= 0) return 'bugün'
  if (days === 1) return 'dün'
  if (days < 7) return `${days} gün önce`
  return `${then.getDate()} ${MONTHS[then.getMonth()]}`
}

export function History({ rounds, onReplay, onDelete }: Props) {
  if (rounds.length === 0) {
    return (
      <p className={styles.empty}>
        henüz geçmiş yok. bir turu tamamla, burada birikir.
      </p>
    )
  }

  return (
    <ul className={styles.list}>
      {rounds.map((round) => (
        <li key={round.id} className={styles.round}>
          <div className={styles.meta}>
            <span>{round.minutes} dk</span>
            <span className={styles.dot} aria-hidden>
              ·
            </span>
            <span>{relativeDate(round.date)}</span>
            <button
              type="button"
              className={styles.del}
              data-press
              aria-label="Bu turu geçmişten sil"
              onClick={() => onDelete(round.id)}
            >
              ×
            </button>
          </div>

          <div className={styles.values}>
            {DICE.map((d) => {
              const r = round.results[d.id]
              return r ? (
                <span key={d.id} className={styles.value}>
                  {r.label}
                </span>
              ) : null
            })}
          </div>

          <button
            type="button"
            className={`btn btn--primary ${styles.replay}`}
            onClick={() => onReplay(round)}
          >
            bu turla başla →
          </button>
        </li>
      ))}
    </ul>
  )
}
