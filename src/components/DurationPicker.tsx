import { useState } from 'react'
import styles from './DurationPicker.module.css'

const MIN = 15
const MAX = 60
const STEP = 5
const PRESETS = [15, 30, 45, 60]

interface Props {
  initial?: number
  confirmLabel?: string
  onConfirm: (minutes: number) => void
}

export function DurationPicker({ initial = 30, confirmLabel = 'zarları getir →', onConfirm }: Props) {
  const [value, setValue] = useState(initial)
  const fill = (value - MIN) / (MAX - MIN)

  return (
    <div className={styles.wrap}>
      <div className={styles.readout}>
        <span className={styles.num}>{value}</span>
        <span className={styles.unit}>dakika</span>
      </div>

      <div className={styles.sliderRow}>
        <input
          className={styles.range}
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={value}
          aria-label="Süre (dakika)"
          onChange={(e) => setValue(Number(e.target.value))}
          style={{ ['--fill' as string]: String(fill) }}
        />
        <div className={styles.ticks}>
          <span>15dk</span>
          <span>60dk</span>
        </div>
      </div>

      <div className={styles.presets}>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={styles.preset}
            data-active={p === value}
            onClick={() => setValue(p)}
          >
            {p} dk
          </button>
        ))}
      </div>

      <button type="button" className="btn btn--primary" onClick={() => onConfirm(value)}>
        {confirmLabel}
      </button>
    </div>
  )
}
