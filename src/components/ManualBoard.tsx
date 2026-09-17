import type { ReactNode } from 'react'
import { DICE } from '../data/dice'
import type { DieId } from '../data/dice'
import type { DieResult, ResultMap } from '../types'
import styles from './ManualBoard.module.css'

interface Props {
  results: ResultMap
  onCommit: (dieId: DieId, result: DieResult | null) => void
  onStart: () => void
  modeToggle: ReactNode
}

/*
 * Kelime alanında ayırıcı virgül değil, zar atınca da kullanılan "·" —
 * kullanıcı boşluğa bastığında otomatik olarak " · " eklenir, yazmaya
 * kaldığı yerden devam eder. Önce "·" ve boşlukları tek bir ayırıcı gibi
 * ele alıp kelimelere bölüyor, sonra tekrar " · " ile birleştiriyoruz;
 * halihazırda yazılmış "·" işaretleri de bu sayede korunuyor. Zar
 * atışındaki gibi (DICE'daki word.draw) en fazla 3 kelime — dördüncüye
 * geçmeye çalışan boşluk/harf yok sayılır.
 */
const MAX_WORDS = 3

function toDotSeparated(raw: string): string {
  const endsWithSpace = /\s$/.test(raw)
  const allWords = raw.split(/[·\s]+/).filter(Boolean)
  const overflowed = allWords.length > MAX_WORDS
  const words = allWords.slice(0, MAX_WORDS)
  const joined = words.join(' · ')
  if (overflowed) return joined
  return endsWithSpace && words.length < MAX_WORDS ? `${joined} · ` : joined
}

/*
 * "kural" gibi uzun cümleler tek satıra sığmıyordu (<input> asla satır
 * sarmaz) — textarea'ya geçip yazıya göre otomatik yükseklik veriyoruz ki
 * zar at kartlarındaki gibi alt satıra geçebilsin.
 *
 * Destekleyen tarayıcılarda bunu CSS'teki field-sizing:content hallediyor —
 * o, textarea'yı bir .value <span>'i kadar tam/doğru yükseklikte ölçüyor.
 * scrollHeight'a dayanan bu JS yöntemi tarayıcının kendi satır-yüksekliği
 * yuvarlamasından ötürü span'den ~yarım piksel daha uzun çıkıyor (ve inline
 * height ataması field-sizing'in üstüne yazıp onu devre dışı bırakıyor) —
 * bu yüzden sadece field-sizing'i desteklemeyen tarayıcılarda devreye giriyor.
 */
const SUPPORTS_FIELD_SIZING =
  typeof CSS !== 'undefined' && CSS.supports?.('field-sizing', 'content')

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el || SUPPORTS_FIELD_SIZING) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

export function ManualBoard({ results, onCommit, onStart, modeToggle }: Props) {
  const filled = DICE.filter((d) => results[d.id]).length
  const allFilled = filled === DICE.length

  const handleChange = (dieId: DieId, raw: string) => {
    if (raw.trim() === '') {
      onCommit(dieId, null)
      return
    }
    if (dieId === 'word') {
      const value = toDotSeparated(raw)
      const words = value.split('·').map((w) => w.trim()).filter(Boolean)
      onCommit(dieId, { dieId, label: value, words })
    } else {
      onCommit(dieId, { dieId, label: raw })
    }
  }

  return (
    <div className={styles.board}>
      <div className={styles.grid}>
        {DICE.map((meta) => (
          <label key={meta.id} className={styles.field}>
            <span className={styles.fieldLabel}>{meta.title}</span>
            <textarea
              ref={autoResize}
              className={styles.input}
              rows={1}
              value={results[meta.id]?.label ?? ''}
              onChange={(e) => {
                autoResize(e.currentTarget)
                handleChange(meta.id, e.target.value)
              }}
              onKeyDown={(e) => {
                // Tek satır gibi davranıyor — Enter yeni satır eklemesin.
                if (e.key === 'Enter') e.preventDefault()
              }}
              placeholder={meta.hint}
              aria-label={meta.title}
            />
          </label>
        ))}
      </div>

      <div className={styles.actions}>
        {/* DiceBoard'daki "hepsini at"ın görünmez ikizi: aynı genişlik ve
            yükseklikte yer tutuyor ki seçici, başla butonu ve sayfa boyu
            (mobildeki alt alta dizilişte de) iki modda birebir aynı olsun. */}
        <button
          type="button"
          className="btn btn--ghost"
          disabled
          aria-hidden
          tabIndex={-1}
          style={{ visibility: 'hidden' }}
        >
          ⟳ hepsini at
        </button>

        {modeToggle}

        <button
          type="button"
          className="btn btn--primary"
          onClick={onStart}
          disabled={!allFilled}
          aria-hidden={!allFilled}
          tabIndex={allFilled ? undefined : -1}
          style={allFilled ? undefined : { visibility: 'hidden' }}
        >
          şarkıya başla →
        </button>
      </div>
    </div>
  )
}
