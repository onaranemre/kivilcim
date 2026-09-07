import { DICE } from '../data/dice'
import type { Countdown } from '../hooks/useCountdown'
import { fmtClock } from '../hooks/useCountdown'
import type { ResultMap } from '../types'
import styles from './SessionTimer.module.css'

interface Props {
  timer: Countdown
  results: ResultMap
  onRestart: () => void
}

const R = 150
const CIRC = 2 * Math.PI * R

export function SessionTimer({ timer, results, onRestart }: Props) {
  const { remaining, total, running, done } = timer
  const progress = total > 0 ? 1 - remaining / total : 0
  const offset = CIRC * (1 - Math.min(1, Math.max(0, progress)))

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        {DICE.map((d) => {
          const r = results[d.id]
          return (
            <div key={d.id} className={styles.chip}>
              {r ? r.label : '—'}
            </div>
          )
        })}
      </div>

      <div
        className={`${styles.clock} ${done ? styles.done : ''} ${running ? styles.pulse : ''}`}
      >
        <svg className={styles.ring} viewBox="0 0 320 320" aria-hidden>
          <defs>
            <linearGradient id="tgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--spark)" />
              <stop offset="1" stopColor="var(--calm)" />
            </linearGradient>
          </defs>
          <circle className={styles.ringTrack} cx="160" cy="160" r={R} />
          <circle
            className={styles.ringProg}
            cx="160"
            cy="160"
            r={R}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
          />
        </svg>
        <div className={styles.time}>{fmtClock(remaining)}</div>
      </div>

      <div className={styles.controls}>
        {!done && (
          <button type="button" className="btn" onClick={timer.toggle}>
            {running ? '❚❚ Duraklat' : '▶ Devam'}
          </button>
        )}
        <button type="button" className="btn btn--ghost" onClick={timer.reset}>
          ↺ Sıfırla
        </button>
        {timer.pipSupported && !done && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={timer.openPip}
            disabled={timer.pipActive}
          >
            ⧉ {timer.pipActive ? 'Pencerede' : 'Küçült'}
          </button>
        )}
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          Yeni tur
        </button>
      </div>
    </div>
  )
}
