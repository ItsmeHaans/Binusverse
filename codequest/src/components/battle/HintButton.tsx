import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HintButtonProps {
  hintsUsed: number       // 0-2, total used this battle
  maxHints?: number
  hintText: string        // hint for the current question
  onUse: () => void       // called when a new hint charge is spent
  disabled?: boolean
}

export default function HintButton({
  hintsUsed,
  maxHints = 2,
  hintText,
  onUse,
  disabled = false,
}: HintButtonProps) {
  const [showHint, setShowHint]       = useState(false)
  const [usedThisQ, setUsedThisQ]     = useState(false)   // tracks if hint was used for current Q
  const hintsLeft = maxHints - hintsUsed
  const exhausted = hintsLeft <= 0
  const canUse = !disabled && !exhausted

  function handleClick() {
    if (!canUse && !usedThisQ) return
    if (!usedThisQ) {
      onUse()
      setUsedThisQ(true)
    }
    setShowHint(prev => !prev)
  }

  // Star cap warning text
  const starWarning =
    hintsUsed === 0 ? 'Using a hint caps your stars at ⭐⭐' :
    hintsUsed === 1 ? 'Using another hint caps your stars at ⭐' :
    null

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={!canUse && !usedThisQ}
        title={exhausted ? 'No hints remaining' : starWarning ?? 'Use a hint'}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold
                    transition-all duration-150 cursor-pointer
                    ${(canUse || usedThisQ) ? 'hover:scale-105 active:scale-95' : 'opacity-40 cursor-not-allowed'}`}
        style={buttonStyle(exhausted, usedThisQ)}>
        <span>💡</span>
        <span>{hintsLeft}</span>
        {usedThisQ && <span className="text-xs opacity-70">{showHint ? '▲' : '▼'}</span>}
      </button>

      <AnimatePresence>
        {showHint && usedThisQ && (
          <motion.div
            className="absolute top-full left-0 mt-2 w-64 rounded-xl px-4 py-3 z-20"
            style={{
              background: 'linear-gradient(135deg,#1e3a5f,#1e4d8c)',
              border: '1px solid rgba(96,165,250,0.5)',
              boxShadow: '0 4px 20px rgba(96,165,250,0.2)',
            }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}>
            <p className="text-xs text-blue-400 font-bold mb-1">💡 Hint</p>
            <p className="text-sm text-blue-100 leading-snug">{hintText}</p>
            {hintsUsed < maxHints && (
              <p className="text-xs text-blue-400 mt-2 opacity-70">
                {maxHints - hintsUsed} hint{maxHints - hintsUsed !== 1 ? 's' : ''} remaining
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function buttonStyle(exhausted: boolean, usedThisQ: boolean): React.CSSProperties {
  if (exhausted && !usedThisQ) {
    return { background: 'rgba(55,65,81,0.4)', border: '1px solid rgba(107,114,128,0.3)', color: '#6b7280' }
  }
  if (usedThisQ) {
    return { background: 'rgba(30,58,95,0.6)', border: '1px solid rgba(96,165,250,0.5)', color: '#93c5fd' }
  }
  return { background: 'rgba(30,58,95,0.4)', border: '1px solid rgba(96,165,250,0.4)', color: '#bfdbfe' }
}
