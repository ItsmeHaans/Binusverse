import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { useSave } from '../hooks/useSave'

type Tab = 'concept' | 'example' | 'practice'
type PracticeState = 'idle' | 'correct' | 'incorrect'

const PRACTICE_Q = {
  question: 'Which function shows text on the screen in Python?',
  options: ['print()', 'show()', 'display()', 'write()'],
  correct: 0,
  explanation: 'print() is Python\'s built-in function for displaying output. The others (show, display, write) are not standard Python functions.',
}

export default function ScrollScreen() {
  const { state, dispatch } = useGame()
  const { save } = useSave()
  const [tab, setTab] = useState<Tab>('concept')
  const [selected, setSelected] = useState<number | null>(null)
  const [practiceState, setPracticeState] = useState<PracticeState>('idle')
  const [scrollDone, setScrollDone] = useState(false)

  const levelNumber = state.battleContext?.levelNumber ?? 1

  function handlePracticeSubmit() {
    if (selected === null) return
    if (selected === PRACTICE_Q.correct) {
      setPracticeState('correct')
      setScrollDone(true)
    } else {
      setPracticeState('incorrect')
    }
  }

  function handlePracticeRetry() {
    setSelected(null)
    setPracticeState('idle')
  }

  function handleDone() {
    const levelKey = `level_${levelNumber}`
    dispatch({ type: 'SAVE_SUB_LEVEL_STARS', levelKey, subLevelKey: 'scroll', stars: 3 })
    save()
    dispatch({ type: 'NAVIGATE', screen: 'map' })
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0f0c29 0%, #1a0533 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'rgba(167,139,250,0.2)', background: 'rgba(15,12,41,0.9)' }}>
        <button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'map' })}
          className="text-purple-400 hover:text-white text-sm cursor-pointer transition">
          ← Back to Map
        </button>
        <span className="text-yellow-400 font-bold text-sm">📜 Scroll of Knowledge</span>
        <span className="text-purple-400 text-sm">Level {levelNumber}</span>
      </div>

      {/* Scroll container */}
      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-6 gap-4">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-yellow-400">✨ The Spell of Speaking</h1>
          <p className="text-purple-300 text-sm mt-1">Learn: print() · input() · Strings · Comments</p>
        </div>

        {/* Tab bar */}
        <div className="flex rounded-xl overflow-hidden border"
          style={{ borderColor: 'rgba(167,139,250,0.3)' }}>
          {(['concept', 'example', 'practice'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize transition cursor-pointer ${tab === t ? 'text-white' : 'text-purple-400 hover:text-purple-200'}`}
              style={{ background: tab === t ? 'linear-gradient(135deg,#7c3aed,#4c1d95)' : 'rgba(124,58,237,0.1)' }}>
              {t === 'concept' ? '📖 Concept' : t === 'example' ? '💻 Example' : '⚡ Practice'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)' }}>

          {tab === 'concept' && <ConceptTab />}
          {tab === 'example' && <ExampleTab />}
          {tab === 'practice' && (
            <PracticeTab
              practiceState={practiceState}
              selected={selected}
              scrollDone={scrollDone}
              onSelect={setSelected}
              onSubmit={handlePracticeSubmit}
              onRetry={handlePracticeRetry}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {tab !== 'concept' && (
            <button onClick={() => setTab(tab === 'practice' ? 'example' : 'concept')}
              className="flex-1 py-3 rounded-xl font-semibold text-purple-300 cursor-pointer transition hover:scale-105"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.3)' }}>
              ← Previous
            </button>
          )}

          {tab !== 'practice' ? (
            <button onClick={() => setTab(tab === 'concept' ? 'example' : 'practice')}
              className="flex-1 py-3 rounded-xl font-bold text-white cursor-pointer transition hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4c1d95)', border: '2px solid rgba(167,139,250,0.5)' }}>
              Next →
            </button>
          ) : (
            <button onClick={handleDone}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition cursor-pointer ${scrollDone ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'}`}
              disabled={!scrollDone}
              style={{ background: scrollDone ? 'linear-gradient(135deg,#065f46,#047857)' : 'rgba(55,65,81,0.5)', border: scrollDone ? '2px solid #34d399' : '2px solid rgba(107,114,128,0.4)' }}>
              {scrollDone ? '🗺️ Go to Battle!' : 'Complete Practice First'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ConceptTab() {
  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed">
      <Section title="🔊 Speaking with print()">
        <p className="text-purple-200">
          In the kingdom of Logica, every spell must be spoken out loud to work. In Python,
          we use <Code>print()</Code> to speak — it shows words on the screen. Think of it
          like shouting a message so everyone can hear it!
        </p>
        <p className="text-purple-200 mt-2">
          Put any text inside the brackets, wrapped in quotes, and Python will display it.
          Numbers don't need quotes — just put them straight in.
        </p>
      </Section>

      <Section title="👂 Listening with input()">
        <p className="text-purple-200">
          While <Code>print()</Code> talks, <Code>input()</Code> listens. It pauses your
          program and waits for the user to type something. Whatever they type is handed
          back to you so you can store it in a variable.
        </p>
        <p className="text-purple-200 mt-2">
          The text inside <Code>input()</Code> is a <em>prompt</em> — a message asking the
          user what to type, like "What is your name?"
        </p>
      </Section>

      <Section title="🔗 Strings & Comments">
        <p className="text-purple-200">
          Text in Python is called a <strong className="text-yellow-300">string</strong>.
          You can join two strings together using <Code>+</Code> — this is called
          concatenation.
        </p>
        <p className="text-purple-200 mt-2">
          Lines starting with <Code>#</Code> are <strong className="text-yellow-300">comments</strong> —
          notes for you, the programmer. Python completely ignores them.
        </p>
      </Section>
    </div>
  )
}

function ExampleTab() {
  return (
    <div className="flex flex-col gap-5 text-sm">
      <div>
        <p className="text-purple-300 mb-2 font-semibold">Using print() and input():</p>
        <CodeBlock>{`# Say hello to the world
print("Hello, Knight Byte!")
# Output: Hello, Knight Byte!

# Ask the user for their name
name = input("What is your name? ")
print("Welcome, " + name + "!")
# Output: Welcome, Byte!`}</CodeBlock>
      </div>

      <div>
        <p className="text-purple-300 mb-2 font-semibold">Strings and concatenation:</p>
        <CodeBlock>{`first = "Code"
second = "Quest"
print(first + second)
# Output: CodeQuest

# Numbers don't need quotes
print(42)
# Output: 42`}</CodeBlock>
      </div>

      <div>
        <p className="text-purple-300 mb-2 font-semibold">Comments are ignored by Python:</p>
        <CodeBlock>{`# This line does nothing — it's a comment
print("But this line runs!")
# Output: But this line runs!`}</CodeBlock>
      </div>
    </div>
  )
}

function PracticeTab({
  practiceState,
  selected,
  scrollDone,
  onSelect,
  onSubmit,
  onRetry,
}: {
  practiceState: PracticeState
  selected: number | null
  scrollDone: boolean
  onSelect: (i: number) => void
  onSubmit: () => void
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-purple-400 text-xs uppercase tracking-widest mb-1">⚡ Practice — No Penalty</p>
        <p className="text-white font-semibold text-base">{PRACTICE_Q.question}</p>
      </div>

      <div className="flex flex-col gap-2">
        {PRACTICE_Q.options.map((opt, i) => {
          let style: React.CSSProperties = { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.3)' }
          if (selected === i && practiceState === 'idle') {
            style = { background: 'rgba(124,58,237,0.4)', border: '2px solid rgba(167,139,250,0.8)' }
          } else if (practiceState !== 'idle' && i === PRACTICE_Q.correct) {
            style = { background: 'rgba(5,150,105,0.3)', border: '2px solid #34d399' }
          } else if (selected === i && practiceState === 'incorrect') {
            style = { background: 'rgba(220,38,38,0.3)', border: '2px solid #f87171' }
          }

          return (
            <button key={i}
              onClick={() => practiceState === 'idle' && onSelect(i)}
              disabled={practiceState !== 'idle'}
              className="w-full py-3 px-4 rounded-xl text-left text-sm text-white font-medium transition cursor-pointer hover:scale-[1.02] disabled:cursor-default"
              style={style}>
              <span className="text-purple-400 mr-2">{String.fromCharCode(65 + i)})</span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {practiceState === 'correct' && (
        <div className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(5,150,105,0.2)', border: '1px solid #34d399' }}>
          <p className="text-green-400 font-bold">🎉 Great! You're ready for battle!</p>
          <p className="text-purple-200 text-xs mt-1">{PRACTICE_Q.explanation}</p>
        </div>
      )}

      {practiceState === 'incorrect' && (
        <div className="rounded-xl p-3"
          style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #f87171' }}>
          <p className="text-red-400 font-bold mb-1">Not quite! Here's why...</p>
          <p className="text-purple-200 text-xs">{PRACTICE_Q.explanation}</p>
          <button onClick={onRetry}
            className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition hover:scale-105"
            style={{ background: 'rgba(124,58,237,0.4)', border: '1px solid rgba(167,139,250,0.5)' }}>
            Try Again
          </button>
        </div>
      )}

      {practiceState === 'idle' && (
        <button onClick={onSubmit} disabled={selected === null}
          className={`py-3 rounded-xl font-bold text-white transition cursor-pointer ${selected !== null ? 'hover:scale-105' : 'opacity-40 cursor-not-allowed'}`}
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4c1d95)', border: '2px solid rgba(167,139,250,0.5)' }}>
          Submit Answer
        </button>
      )}

      {scrollDone && (
        <p className="text-center text-green-400 text-xs font-semibold">
          ✓ Scroll completed — click "Go to Battle!" below
        </p>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
      <p className="text-yellow-400 font-bold text-sm mb-2">{title}</p>
      {children}
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded text-yellow-300 text-xs font-mono"
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      {children}
    </code>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-xl p-4 text-xs font-mono text-green-300 overflow-x-auto"
      style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(74,222,128,0.2)', lineHeight: '1.6' }}>
      {children}
    </pre>
  )
}
