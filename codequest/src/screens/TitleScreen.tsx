import { useState } from 'react'
import { useSave } from '../hooks/useSave'
import { hasSave } from '../utils/saveData'

export default function TitleScreen() {
  const { load, newGame } = useSave()
  const [showAbout, setShowAbout] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const saveExists = hasSave()

  function handleStart() {
    if (saveExists) {
      setConfirmNew(true)
    } else {
      newGame()
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f0c29 0%, #1a0533 50%, #0f0c29 100%)' }}>

      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: s.x, top: s.y, width: s.size, height: s.size, opacity: s.opacity }} />
        ))}
      </div>

      {/* Logo / title */}
      <div className="relative z-10 flex flex-col items-center gap-6 mb-12">
        <div className="text-7xl mb-2">⚔️</div>
        <h1 className="text-5xl md:text-6xl font-black text-center leading-tight"
          style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00, #ff6b00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CodeQuest
        </h1>
        <p className="text-xl md:text-2xl text-purple-300 font-semibold tracking-widest uppercase">
          Rescue the Princess
        </p>
        <p className="text-sm text-purple-400 italic max-w-xs text-center">
          Help Knight Byte save Princess Alina by mastering the power of Python!
        </p>
      </div>

      {/* Menu buttons */}
      <div className="relative z-10 flex flex-col items-center gap-4 w-64">
        <button onClick={handleStart}
          className="w-full py-4 rounded-xl font-bold text-lg text-white tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', border: '2px solid #a78bfa', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }}>
          ⚔️ Start Game
        </button>

        {saveExists && (
          <button onClick={load}
            className="w-full py-4 rounded-xl font-bold text-lg text-white tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #065f46, #064e3b)', border: '2px solid #34d399', boxShadow: '0 0 20px rgba(52,211,153,0.3)' }}>
            📖 Continue
          </button>
        )}

        <button onClick={() => setShowAbout(true)}
          className="w-full py-3 rounded-xl font-semibold text-base text-purple-300 tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.4)' }}>
          📜 About
        </button>
      </div>

      <p className="relative z-10 mt-12 text-xs text-purple-600">
        v0.1.0 — Phase 1 Prototype
      </p>

      {/* About modal */}
      {showAbout && (
        <Modal onClose={() => setShowAbout(false)}>
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">About CodeQuest</h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-3">
            CodeQuest: Rescue the Princess is an educational RPG designed for kids aged 6–12.
            Battle monsters by solving Python coding challenges across 6 magical worlds.
          </p>
          <p className="text-purple-200 text-sm leading-relaxed mb-3">
            Learn <span className="text-yellow-300 font-semibold">print()</span>,{' '}
            <span className="text-yellow-300 font-semibold">input()</span>, arithmetic,
            if-else, loops, functions, and lists — one adventure at a time.
          </p>
          <p className="text-purple-400 text-xs mt-4">
            Built with React + TypeScript + Tailwind CSS
          </p>
        </Modal>
      )}

      {/* Confirm new game modal */}
      {confirmNew && (
        <Modal onClose={() => setConfirmNew(false)}>
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Start New Game?</h2>
          <p className="text-purple-200 text-sm leading-relaxed mb-6">
            This will erase your current saved progress. Are you sure?
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setConfirmNew(false); newGame() }}
              className="flex-1 py-3 rounded-xl font-bold text-white cursor-pointer transition hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', border: '1px solid #f87171' }}>
              Yes, start over
            </button>
            <button onClick={() => setConfirmNew(false)}
              className="flex-1 py-3 rounded-xl font-bold text-purple-200 cursor-pointer transition hover:scale-105"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.4)' }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-sm rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #1e1040, #2d1b69)', border: '1px solid rgba(167,139,250,0.5)', boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-3 right-4 text-purple-400 hover:text-white text-xl cursor-pointer">
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

// Static star positions (deterministic, no runtime random)
const STARS = [
  { x: '5%',  y: '8%',  size: 2, opacity: 0.6 },
  { x: '12%', y: '22%', size: 1, opacity: 0.4 },
  { x: '20%', y: '5%',  size: 3, opacity: 0.5 },
  { x: '30%', y: '15%', size: 1, opacity: 0.7 },
  { x: '42%', y: '3%',  size: 2, opacity: 0.5 },
  { x: '55%', y: '10%', size: 1, opacity: 0.4 },
  { x: '65%', y: '18%', size: 2, opacity: 0.6 },
  { x: '75%', y: '6%',  size: 3, opacity: 0.4 },
  { x: '85%', y: '12%', size: 1, opacity: 0.7 },
  { x: '92%', y: '4%',  size: 2, opacity: 0.5 },
  { x: '8%',  y: '40%', size: 1, opacity: 0.3 },
  { x: '18%', y: '55%', size: 2, opacity: 0.4 },
  { x: '88%', y: '35%', size: 1, opacity: 0.5 },
  { x: '95%', y: '50%', size: 2, opacity: 0.3 },
  { x: '3%',  y: '70%', size: 1, opacity: 0.4 },
  { x: '78%', y: '65%', size: 2, opacity: 0.5 },
  { x: '90%', y: '80%', size: 1, opacity: 0.3 },
  { x: '25%', y: '85%', size: 2, opacity: 0.4 },
  { x: '50%', y: '90%', size: 1, opacity: 0.5 },
  { x: '70%', y: '88%', size: 3, opacity: 0.3 },
]
