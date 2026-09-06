import { useState } from 'react'
import type { DieId, WordCategoryId } from './data/dice'
import type { DieResult, ResultMap, Screen } from './types'
import { DurationPicker } from './components/DurationPicker'
import { DiceBoard } from './components/DiceBoard'
import { SessionTimer } from './components/SessionTimer'
import { ThemeToggle } from './components/ThemeToggle'
import { useTheme } from './hooks/useTheme'
import { useCountdown } from './hooks/useCountdown'
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
  const [wordCat, setWordCat] = useState<WordCategoryId>('karisik')

  const { effective, toggle } = useTheme()
  const timer = useCountdown()

  const hasProgress = timer.active || Object.values(results).some(Boolean)

  const commit = (dieId: DieId, result: DieResult) => {
    setResults((prev) => ({ ...prev, [dieId]: result }))
  }

  const confirmDuration = (m: number) => {
    if (timer.active && m !== minutes) timer.stop()
    setMinutes(m)
    setScreen('rolling')
  }

  const startSession = () => {
    timer.start(minutes * 60_000)
    setScreen('session')
  }

  const restart = () => {
    timer.stop()
    setResults(EMPTY_RESULTS)
    setScreen('setup')
  }

  return (
    <main className={`${styles.app} app`}>
      <ThemeToggle theme={effective} onToggle={toggle} />

      <header className={styles.header}>
        <div className={styles.mark} aria-hidden>
          <span>◈</span>
          <span>✶</span>
          <span>⌘</span>
          <span>❍</span>
        </div>
        <h1 className={styles.title}>kıvılcım</h1>
      </header>

      {screen === 'setup' && (
        <section className={styles.stage} key="setup">
          {hasProgress && (
            <div className={styles.stageNav}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setScreen('rolling')}
              >
                ← zarlara dön
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
            {timer.active && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setScreen('session')}
              >
                sayaca dön →
              </button>
            )}
          </div>
          <div className={styles.stageIntro}>
            <h2>zarları at</h2>
            <span>{minutes} dakikalık tur</span>
          </div>
          <DiceBoard
            results={results}
            wordCat={wordCat}
            onWordCat={setWordCat}
            onCommit={commit}
            onStart={startSession}
          />
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
          <div className={styles.stageIntro}>
            <h2>şimdi yaz</h2>
          </div>
          <SessionTimer timer={timer} results={results} onRestart={restart} />
        </section>
      )}

      <footer className={styles.foot}>zar · söz · sayaç</footer>
    </main>
  )
}
