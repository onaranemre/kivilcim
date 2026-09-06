import type { DieId, WordCategoryId } from './data/dice'

export interface DieResult {
  dieId: DieId
  /** Ekranda ve özetlerde gösterilen metin. */
  label: string
  /** Yalnızca kelime zarında dolu olur. */
  words?: string[]
  wordCategory?: WordCategoryId
}

export type ResultMap = Record<DieId, DieResult | null>

export interface DieHandle {
  roll: () => void
}

export type Screen = 'setup' | 'rolling' | 'session'
