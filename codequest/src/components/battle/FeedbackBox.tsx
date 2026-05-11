import { motion } from 'framer-motion'

interface FeedbackBoxProps {
  correct: boolean
  explanation: string
  correctAnswerDisplay: string
  damageTaken?: number
  isSpecialAttack?: boolean
  onContinue: () => void
}

export default function FeedbackBox({
  correct,
  explanation,
  correctAnswerDisplay,
  damageTaken,
  isSpecialAttack = false,
  onContinue,
}: FeedbackBoxProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-30"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />

      {/* Panel slides up from bottom */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl px-5 pt-5 pb-8"
        style={panelStyle(correct, isSpecialAttack)}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-4"
          style={{ background: 'rgba(255,255,255,0.2)' }} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{headerEmoji(correct, isSpecialAttack)}</span>
          <div>
            <p className="font-black text-lg leading-tight" style={{ color: headerColor(correct, isSpecialAttack) }}>
              {headerText(correct, isSpecialAttack)}
            </p>
            {!correct && damageTaken !== undefined && damageTaken > 0 && (
              <p className="text-xs font-semibold mt-0.5" style={{ color: isSpecialAttack ? '#fb923c' : '#fca5a5' }}>
                {isSpecialAttack ? '⚡ Special Attack! ' : ''}
                -{damageTaken} HP
              </p>
            )}
          </div>
        </div>

        {/* Correct answer (only when wrong) */}
        {!correct && (
          <div className="rounded-xl px-4 py-2.5 mb-3"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs text-gray-400 mb-1">Correct answer:</p>
            <code className="text-sm font-mono text-yellow-300">{correctAnswerDisplay}</code>
          </div>
        )}

        {/* Explanation */}
        <p className="text-sm leading-relaxed mb-5"
          style={{ color: correct ? '#a7f3d0' : '#d1d5db' }}>
          {explanation}
        </p>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl font-black text-base text-white tracking-wide
                     transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
          style={continueButtonStyle(correct, isSpecialAttack)}>
          {correct ? 'Keep Going! →' : 'Continue →'}
        </button>
      </motion.div>
    </>
  )
}

function headerEmoji(correct: boolean, special: boolean) {
  if (correct)  return '⚔️'
  if (special)  return '💥'
  return '🛡️'
}

function headerText(correct: boolean, special: boolean) {
  if (correct)  return 'Correct! Byte attacks!'
  if (special)  return 'Special Attack!'
  return 'Incorrect!'
}

function headerColor(correct: boolean, special: boolean) {
  if (correct)  return '#6ee7b7'
  if (special)  return '#fb923c'
  return '#fca5a5'
}

function panelStyle(correct: boolean, special: boolean): React.CSSProperties {
  if (correct) {
    return {
      background: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)',
      borderTop: '3px solid #34d399',
      boxShadow: '0 -8px 32px rgba(52,211,153,0.25)',
    }
  }
  if (special) {
    return {
      background: 'linear-gradient(180deg, #431407 0%, #7c2d12 100%)',
      borderTop: '3px solid #f97316',
      boxShadow: '0 -8px 32px rgba(249,115,22,0.35)',
    }
  }
  return {
    background: 'linear-gradient(180deg, #1f0a0a 0%, #450a0a 100%)',
    borderTop: '3px solid #ef4444',
    boxShadow: '0 -8px 32px rgba(239,68,68,0.25)',
  }
}

function continueButtonStyle(correct: boolean, special: boolean): React.CSSProperties {
  if (correct) {
    return {
      background: 'linear-gradient(135deg, #059669, #047857)',
      border: '2px solid #34d399',
      boxShadow: '0 0 16px rgba(52,211,153,0.3)',
    }
  }
  if (special) {
    return {
      background: 'linear-gradient(135deg, #c2410c, #9a3412)',
      border: '2px solid #fb923c',
    }
  }
  return {
    background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
    border: '2px solid #f87171',
  }
}
