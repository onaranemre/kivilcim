import { useEffect, useRef, useState } from 'react'
import type { DieId } from './data/dice'
import type { DieResult, ResultMap, Screen } from './types'
import { DurationPicker } from './components/DurationPicker'
import { DiceBoard } from './components/DiceBoard'
import { SessionTimer } from './components/SessionTimer'
import { History } from './components/History'
import { DieFace } from './components/DieFace'
import { useCountdown } from './hooks/useCountdown'
import { useHistory, sameRound, type HistoryRound } from './hooks/useHistory'
import styles from './App.module.css'

const EMPTY_RESULTS: ResultMap = {
  style: null,
  emotion: null,
  rule: null,
  perspective: null,
  word: null,
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [minutes, setMinutes] = useState(30)
  const [results, setResults] = useState<ResultMap>(EMPTY_RESULTS)
  const [notes, setNotes] = useState('')
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null)

  // Not defteri: Claude Code'daki yan yana bölünmüş pencereler gibi, sağda
  // ayrılabilen/sürükleyerek genişletilebilen bir bölme. Sadece süre
  // yeniden başlar/ekran değişirse kendiliğinden kapanır (bkz. aşağıdaki efekt).
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesWidth, setNotesWidth] = useState(380)
  // Sürüklerken genişlik geçişini (transition) kapatıyoruz — açık kalsaydı
  // her fare hareketinde kutu hedefin arkasından "kasıla kasıla" yetişmeye
  // çalışıyor, gerçek sürüklemeymiş gibi değil de takılıyormuş gibi
  // görünüyordu. Sadece açma/kapama geçişinde animasyon kalsın istiyoruz.
  const [isResizingNotes, setIsResizingNotes] = useState(false)
  const draggingNotes = useRef(false)

  const timer = useCountdown()
  const history = useHistory()

  const anyRolled = Object.values(results).some(Boolean)
  const hasProgress = timer.active || anyRolled

  const commit = (dieId: DieId, result: DieResult) => {
    setResults((prev) => ({ ...prev, [dieId]: result }))
  }

  // Turu sıfırla ama zar ekranında kal.
  const clearDice = () => {
    timer.stop()
    setResults(EMPTY_RESULTS)
  }

  const confirmDuration = (m: number) => {
    if (timer.active && m !== minutes) timer.stop()
    setMinutes(m)
    setScreen('rolling')
  }

  const startSession = () => {
    const latest = history.rounds[0]
    const isDupe = !!latest && latest.minutes === minutes && sameRound(results, latest.results)
    const id = isDupe ? latest.id : history.add(minutes, results, notes)
    setCurrentRoundId(id)
    timer.start(minutes * 60_000, minutes === 0)
    setScreen('session')
  }

  // Not defterindeki her değişiklik, üzerinde çalışılan turun geçmiş
  // kaydına da işlenir — böylece notlar kalıcı olur ve geçmişte görünür.
  const updateNotes = (text: string) => {
    setNotes(text)
    if (currentRoundId) history.updateNotes(currentRoundId, text)
  }

  // Not defteri sadece sayaç ekranına ait — başka bir ekrana geçilince
  // (zarlara dön, süreyi değiştir, vb.) kendiliğinden kapanır.
  useEffect(() => {
    if (screen !== 'session') setNotesOpen(false)
  }, [screen])

  // Bölmeler arası ayırıcı: Claude Code'un kendi yan yana pencereleri gibi
  // sürüklenerek genişletilir/daraltılır. Sağ kenar sabit olduğundan
  // genişlik = pencere sağ ucu ile imleç arası mesafe.
  const onDividerDown = () => {
    draggingNotes.current = true
    setIsResizingNotes(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    let rafId = 0
    const onMove = (e: globalThis.MouseEvent) => {
      if (!draggingNotes.current) return
      const clientX = e.clientX
      // rAF ile örnekleme: her mousemove'da değil, boyama döngüsü başına en
      // fazla bir state güncellemesi — hızlı sürüklemede gereksiz ara
      // render'ları (ve onlarla gelen takılmayı) önlüyor.
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setNotesWidth(Math.min(680, Math.max(300, window.innerWidth - clientX)))
      })
    }
    const onUp = () => {
      draggingNotes.current = false
      setIsResizingNotes(false)
      cancelAnimationFrame(rafId)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const restart = () => {
    timer.stop()
    setResults(EMPTY_RESULTS)
    setNotes('')
    setCurrentRoundId(null)
    setScreen('setup')
  }

  // Geçmişi tamamen silmek, üzerinde çalışılan turu da bırakır — aksi halde
  // geçmiş boşalır ama ekranda hâlâ atılmış zarlar/aktif sayaç kalırdı.
  const clearAllHistory = () => {
    history.clear()
    restart()
  }

  // Tek bir turu silmek: eğer silinen tur şu an ekranda duran/üzerinde
  // çalışılan turun ta kendisiyse (aynı süre + aynı zar sonuçları), o turu
  // da bırak — aksi halde geçmişten "silinmiş" bir tur ekranda asılı kalırdı.
  const deleteRound = (id: string) => {
    const round = history.rounds.find((r) => r.id === id)
    const isCurrent = !!round && round.minutes === minutes && sameRound(results, round.results)
    history.remove(id)
    if (isCurrent) restart()
  }

  // Geçmişten bir tur: sonuçları (ve varsa notlarını) yükle, zar ekranına
  // geç (istenirse değiştirilebilir). Notlar da yüklenmezse, o turu yeniden
  // başlatıp not defterini açtığında eski notlar görünmezdi.
  const replayRound = (round: HistoryRound) => {
    timer.stop()
    setMinutes(round.minutes)
    setResults(round.results)
    setNotes(round.notes ?? '')
    setCurrentRoundId(round.id)
    setScreen('rolling')
  }

  return (
    <div className={styles.splitRoot}>
      <main className={`${styles.app} app`}>
        <header className={styles.header}>
          <div className={styles.mark} aria-hidden>
            <DieFace face={2} />
            <DieFace face={5} />
            <DieFace face={3} />
          </div>
          <h1 className={styles.title}>kıvılcım</h1>
          <p className={styles.signature}>emre onaran</p>
        </header>

        {screen === 'setup' && (
          <section className={styles.stage} key="setup">
            {history.rounds.length > 0 && (
              <div className={styles.setupNav}>
                <button type="button" className="btn btn--ghost" onClick={() => setScreen('history')}>
                  geçmiş · {history.rounds.length}
                </button>
              </div>
            )}
            <DurationPicker
              initial={minutes}
              confirmLabel={hasProgress ? 'devam →' : 'zarları getir →'}
              onConfirm={confirmDuration}
            />
          </section>
        )}

        {screen === 'rolling' && (
          <section className={styles.stage} key="rolling">
            <div className={styles.stageNav}>
              <button type="button" className="btn btn--ghost" onClick={() => setScreen('setup')}>
                ← süreyi değiştir
              </button>
              {anyRolled && (
                <button type="button" className="btn btn--ghost" onClick={clearDice}>
                  ↺ sıfırla
                </button>
              )}
            </div>
            <DiceBoard results={results} onCommit={commit} onStart={startSession} />
          </section>
        )}

        {screen === 'session' && (
          <section className={styles.stage} key="session">
            <div className={styles.stageNav}>
              <button type="button" className="btn btn--ghost" onClick={() => setScreen('rolling')}>
                ← zarlara dön
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setScreen('setup')}>
                süreyi değiştir
              </button>
            </div>
            <SessionTimer timer={timer} results={results} onRestart={restart} />
          </section>
        )}

        {screen === 'history' && (
          <section className={styles.stage} key="history">
            <div className={styles.stageNav}>
              <button type="button" className="btn btn--ghost" onClick={() => setScreen('setup')}>
                ← geri
              </button>
              {history.rounds.length > 0 && (
                <button type="button" className="btn btn--ghost" onClick={clearAllHistory}>
                  tümünü sil
                </button>
              )}
            </div>
            <History rounds={history.rounds} onReplay={replayRound} onDelete={deleteRound} />
          </section>
        )}

        {screen === 'session' && !notesOpen && (
          <button
            type="button"
            className={`btn btn--primary ${styles.notesFab}`}
            data-press
            onClick={() => setNotesOpen(true)}
            aria-label="not defterini aç"
          >
            ✎
          </button>
        )}
      </main>

      {notesOpen && <div className={styles.splitDivider} onMouseDown={onDividerDown} />}

      <aside
        className={styles.notesPane}
        style={{
          width: notesOpen ? notesWidth : 0,
          transition: isResizingNotes ? 'none' : undefined,
        }}
      >
        <div className={styles.notesPaneInner} style={{ width: notesWidth }}>
          <div className={styles.notesPaneHeader}>
            <span>not defteri</span>
            <button
              type="button"
              className={styles.notesPaneClose}
              data-press
              onClick={() => setNotesOpen(false)}
              aria-label="kapat"
            >
              ×
            </button>
          </div>
          <textarea
            className={styles.notesArea}
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="akorlar, sözler, aklına geleni yaz…"
          />
        </div>
      </aside>
    </div>
  )
}
