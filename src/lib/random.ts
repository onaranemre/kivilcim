export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Farklı bir eleman seç (önceki ile aynıysa tekrar dene). */
export function pickDifferent<T>(arr: readonly T[], prev: T | null): T {
  if (arr.length <= 1) return arr[0]
  let next = pick(arr)
  let guard = 0
  while (next === prev && guard < 20) {
    next = pick(arr)
    guard++
  }
  return next
}

/** Tekrarsız n eleman seç (Fisher–Yates ile). */
export function sample<T>(arr: readonly T[], n: number): T[] {
  const copy = arr.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(n, copy.length))
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}
