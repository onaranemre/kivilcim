import { useState } from 'react'
import styles from './DurationPicker.module.css'

const MIN = 0
const MAX = 60
const STEP = 5

interface Props {
  initial?: number
  confirmLabel?: string
  onConfirm: (minutes: number) => void
}

export function DurationPicker({ initial = 30, confirmLabel = 'zarları getir →', onConfirm }: Props) {
  const [minutes, setMinutes] = useState(initial)

  return (
    <div className={styles.wrap}>
      <div className={styles.readout}>
        <span className={styles.num}>{minutes}</span>
        <span className={styles.unit}>dakika</span>
      </div>

      <div className={styles.sliderRow}>
        <input
          className={styles.range}
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={minutes}
          aria-label="Süre (dakika)"
          aria-valuetext={`${minutes} dakika`}
          onChange={(e) => setMinutes(Number(e.target.value))}
          style={{ ['--fill' as string]: String((minutes - MIN) / (MAX - MIN)) }}
        />
        <div className={styles.ticks}>
          <span>0dk</span>
          <span>30dk</span>
          <span>60dk</span>
        </div>
      </div>

      <button
        type="button"
        className="btn btn--primary"
        disabled={minutes === 0}
        onClick={() => onConfirm(minutes)}
      >
        {confirmLabel}
      </button>
    </div>
  )
}
