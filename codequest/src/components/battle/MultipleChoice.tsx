const LABELS = ['A', 'B', 'C', 'D']

interface MultipleChoiceProps {
  options: string[]
  selectedIndex: number | null
  correctIndex: number
  revealed: boolean
  onSelect: (index: number) => void
}

export default function MultipleChoice({
  options,
  selectedIndex,
  correctIndex,
  revealed,
  onSelect,
}: MultipleChoiceProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((opt, i) => {
        const isSelected = selectedIndex === i
        const isCorrect = i === correctIndex

        const style = getOptionStyle(isSelected, isCorrect, revealed)

        return (
          <button
            key={i}
            onClick={() => !revealed && onSelect(i)}
            disabled={revealed}
            className="flex items-start gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium
                       transition-all duration-200 cursor-pointer
                       disabled:cursor-default hover:scale-[1.02] active:scale-95
                       disabled:hover:scale-100"
            style={style.container}
          >
            {/* Label badge */}
            <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                             text-xs font-black mt-0.5"
              style={style.badge}>
              {revealed && isCorrect
                ? '✓'
                : revealed && isSelected && !isCorrect
                ? '✗'
                : LABELS[i]}
            </span>

            <span className="leading-snug" style={{ color: style.textColor }}>
              {opt}
            </span>
          </button>
        )
      })}
    </div>
  )
}

interface OptionStyle {
  container: React.CSSProperties
  badge: React.CSSProperties
  textColor: string
}

function getOptionStyle(
  isSelected: boolean,
  isCorrect: boolean,
  revealed: boolean,
): OptionStyle {
  // Post-reveal: correct answer
  if (revealed && isCorrect) {
    return {
      container: {
        background: 'rgba(5,150,105,0.25)',
        border: '2px solid #34d399',
        boxShadow: '0 0 12px rgba(52,211,153,0.3)',
      },
      badge: { background: '#059669', color: '#fff' },
      textColor: '#a7f3d0',
    }
  }

  // Post-reveal: wrong selection
  if (revealed && isSelected && !isCorrect) {
    return {
      container: {
        background: 'rgba(220,38,38,0.2)',
        border: '2px solid #f87171',
      },
      badge: { background: '#dc2626', color: '#fff' },
      textColor: '#fca5a5',
    }
  }

  // Post-reveal: unselected, wrong options — dimmed
  if (revealed) {
    return {
      container: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(107,114,128,0.3)',
        opacity: 0.45,
      },
      badge: { background: 'rgba(107,114,128,0.4)', color: '#9ca3af' },
      textColor: '#6b7280',
    }
  }

  // Pre-reveal: selected
  if (isSelected) {
    return {
      container: {
        background: 'rgba(124,58,237,0.35)',
        border: '2px solid rgba(167,139,250,0.9)',
        boxShadow: '0 0 14px rgba(124,58,237,0.45)',
      },
      badge: { background: '#7c3aed', color: '#fff' },
      textColor: '#e9d5ff',
    }
  }

  // Pre-reveal: default
  return {
    container: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(167,139,250,0.25)',
    },
    badge: { background: 'rgba(124,58,237,0.3)', color: '#c4b5fd' },
    textColor: '#d1d5db',
  }
}
