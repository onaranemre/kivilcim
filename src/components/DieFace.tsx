/** 3x3 ızgarada pip konumları (sütun, satır) — 0..2. */
const PIPS: Record<number, ReadonlyArray<readonly [number, number]>> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
}

export function randomFace(not?: number): number {
  const f = 1 + Math.floor(Math.random() * 6)
  return f === not ? (f % 6) + 1 : f
}

interface Props {
  face: number
  className?: string
}

export function DieFace({ face, className }: Props) {
  const pips = PIPS[face] ?? PIPS[1]
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <rect x="1.2" y="1.2" width="21.6" height="21.6" rx="6.5" />
      {pips.map(([c, r], i) => (
        <circle key={i} cx={6 + c * 6} cy={6 + r * 6} r="2.05" />
      ))}
    </svg>
  )
}
