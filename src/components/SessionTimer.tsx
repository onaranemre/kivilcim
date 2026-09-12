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
  // Halka toplam süreyi temsil ediyor: dolu başlar, süre azaldıkça
  // (biriken değil, tüketilen bir şey gibi) 12 yönünden başlayarak erir.
  const elapsed = total > 0 ? 1 - remaining / total : 0
  const offset = CIRC * Math.min(1, Math.max(0, elapsed))

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

      {/*
       * Ayrı bir duraklat/devam butonu yok — saatin kendisi tıklanabilir:
       * üzerine gelince rakamlar söner, yerine PiP penceresindeki ile aynı
       * camsı duraklat/oynat ikonu belirir.
       */}
      <button
        type="button"
        className={`${styles.clock} ${done ? styles.done : ''} ${running ? styles.pulse : ''}`}
        data-press
        onClick={timer.toggle}
        disabled={done}
        aria-label={done ? 'süre doldu' : running ? 'duraklat' : 'devam'}
      >
        <svg className={styles.ring} viewBox="0 0 320 320" aria-hidden>
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
        <span
          className={`${styles.icon} ${running ? styles.iconPause : styles.iconPlay}`}
          aria-hidden
        />
      </button>

      <div className={styles.controls}>
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
        <button type="button" className="btn btn--primary" onClick={onRestart}>
          Yeni tur
        </button>
      </div>
    </div>
  )
}
