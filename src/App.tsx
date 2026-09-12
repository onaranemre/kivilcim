import { useState } from 'react'
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
    if (!isDupe) history.add(minutes, results)
    timer.start(minutes * 60_000)
    setScreen('session')
  }

  const restart = () => {
    timer.stop()
    setResults(EMPTY_RESULTS)
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

  // Geçmişten bir tur: sonuçları yükle, zar ekranına geç (istenirse değiştirilebilir).
  const replayRound = (round: HistoryRound) => {
    timer.stop()
    setMinutes(round.minutes)
    setResults(round.results)
    setScreen('rolling')
  }

  return (
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
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setScreen('history')}
              >
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
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setScreen('setup')}
            >
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
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setScreen('rolling')}
            >
              ← zarlara dön
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setScreen('setup')}
            >
              süreyi değiştir
            </button>
          </div>
          <SessionTimer timer={timer} results={results} onRestart={restart} />
        </section>
      )}

      {screen === 'history' && (
        <section className={styles.stage} key="history">
          <div className={styles.stageNav}>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setScreen('setup')}
            >
              ← geri
            </button>
            {history.rounds.length > 0 && (
              <button type="button" className="btn btn--ghost" onClick={clearAllHistory}>
                tümünü sil
              </button>
            )}
          </div>
          <History
            rounds={history.rounds}
            onReplay={replayRound}
            onDelete={deleteRound}
          />
        </section>
      )}
    </main>
  )
}
