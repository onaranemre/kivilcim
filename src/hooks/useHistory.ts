import { useCallback, useState } from 'react'
import { DICE } from '../data/dice'
import { uid } from '../lib/random'
import type { ResultMap } from '../types'

export interface HistoryRound {
  id: string
  date: number
  minutes: number
  results: ResultMap
}

const KEY = 'kivilcim-history'
const MAX = 30

function read(): HistoryRound[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is HistoryRound =>
        !!r &&
        typeof r.id === 'string' &&
        typeof r.minutes === 'number' &&
        typeof r.results === 'object',
    )
  } catch {
    return []
  }
}

function write(rounds: HistoryRound[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(rounds))
  } catch {
    /* kota dolu / gizli mod: sessizce geç */
  }
}

/** İki turun zar sonuçları aynı mı? (aynı turu tekrar tekrar kaydetmemek için) */
export function sameRound(a: ResultMap, b: ResultMap | undefined): boolean {
  if (!b) return false
  return DICE.every((d) => a[d.id]?.label === b[d.id]?.label)
}

export function useHistory() {
  const [rounds, setRounds] = useState<HistoryRound[]>(read)

  const add = useCallback((minutes: number, results: ResultMap) => {
    setRounds((prev) => {
      const next = [
        { id: uid(), date: Date.now(), minutes, results: { ...results } },
        ...prev,
      ].slice(0, MAX)
      write(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setRounds((prev) => {
      const next = prev.filter((r) => r.id !== id)
      write(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setRounds([])
    write([])
  }, [])

  return { rounds, add, remove, clear }
}
