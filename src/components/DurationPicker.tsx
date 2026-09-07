import { useState } from 'react'
import styles from './DurationPicker.module.css'

const MIN = 15
const MID = 30
const MAX = 60
const STEP = 5

/**
 * Slider konumu (0–100) ile dakika arasında iki parçalı eşleme:
 * sol yarı 15→30, sağ yarı 30→60. Böylece topuz tam ortadayken 30 dk olur.
 */
function posToMinutes(pos: number): number {
  const raw =
    pos <= 50
      ? MIN + (pos / 50) * (MID - MIN)
      : MID + ((pos - 50) / 50) * (MAX - MID)
  return Math.min(MAX, Math.max(MIN, Math.round(raw / STEP) * STEP))
}

function minutesToPos(min: number): number {
  return min <= MID
    ? ((min - MIN) / (MID - MIN)) * 50
    : 50 + ((min - MID) / (MAX - MID)) * 50
}

interface Props {
  initial?: number
  confirmLabel?: string
  onConfirm: (minutes: number) => void
}

export function DurationPicker({ initial = 30, confirmLabel = 'zarları getir →', onConfirm }: Props) {
  const [pos, setPos] = useState(() => minutesToPos(initial))
  const minutes = posToMinutes(pos)

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
          min={0}
          max={100}
          step={1}
          value={pos}
          aria-label="Süre (dakika)"
          aria-valuetext={`${minutes} dakika`}
          onChange={(e) => setPos(Number(e.target.value))}
          style={{ ['--fill' as string]: String(pos / 100) }}
        />
        <div className={styles.ticks}>
          <span>15dk</span>
          <span>30dk</span>
          <span>60dk</span>
        </div>
      </div>

      <button type="button" className="btn btn--primary" onClick={() => onConfirm(minutes)}>
        {confirmLabel}
      </button>
    </div>
  )
}
