import type { DieId } from './data/dice'

export interface DieResult {
  dieId: DieId
  /** Ekranda ve özetlerde gösterilen metin. */
  label: string
  /** Kelime zarında üç kelime ayrı ayrı da tutulur. */
  words?: string[]
}

export type ResultMap = Record<DieId, DieResult | null>

export interface DieHandle {
  roll: () => void
}

export type Screen = 'setup' | 'rolling' | 'session'
