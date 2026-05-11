import { useRef, useEffect } from 'react'

interface FillInBlankProps {
  codeTemplate: string
  correctAnswer: string
  revealed: boolean
  value: string
  onChange: (value: string) => void
}

const BLANK = '___'

export default function FillInBlank({
  codeTemplate,
  correctAnswer,
  revealed,
  value,
  onChange,
}: FillInBlankProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isCorrect = revealed && value.trim() === correctAnswer.trim()

  // Focus input on mount / question change
  useEffect(() => {
    if (!revealed) inputRef.current?.focus()
  }, [codeTemplate, revealed])

  const parts = codeTemplate.split(BLANK)
  const before = parts[0] ?? ''
  const after = parts[1] ?? ''

  // Estimate input width: at least 6ch, expands with content
  const inputWidth = `${Math.max(6, Math.max(value.length, correctAnswer.length) + 2)}ch`

  const inputStyle: React.CSSProperties = revealed
    ? isCorrect
      ? { borderBottom: '2px solid #34d399', color: '#6ee7b7', background: 'rgba(5,150,105,0.15)' }
      : { borderBottom: '2px solid #f87171', color: '#fca5a5', background: 'rgba(220,38,38,0.15)' }
    : {
        borderBottom: '2px solid rgba(167,139,250,0.7)',
        color: '#e9d5ff',
        background: 'rgba(124,58,237,0.15)',
      }

  return (
    <div className="flex flex-col gap-4">
      {/* Code line with inline blank */}
      <div className="rounded-xl px-5 py-4"
        style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(167,139,250,0.2)' }}>
        <div className="flex items-center flex-wrap gap-0 font-mono text-base leading-relaxed">
          {before && (
            <span className="text-green-300 whitespace-pre">{before}</span>
          )}

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => !revealed && onChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.form?.requestSubmit()}
            disabled={revealed}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="none"
            placeholder="???"
            className="font-mono text-base text-center rounded px-1 outline-none
                       transition-all duration-200 disabled:cursor-default
                       placeholder:text-purple-600"
            style={{ width: inputWidth, ...inputStyle }}
          />

          {after && (
            <span className="text-green-300 whitespace-pre">{after}</span>
          )}
        </div>
      </div>

      {/* Post-reveal feedback */}
      {revealed && (
        <div className="rounded-xl px-4 py-3"
          style={isCorrect
            ? { background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(52,211,153,0.4)' }
            : { background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(248,113,113,0.4)' }}>
          {isCorrect ? (
            <p className="text-green-400 text-sm font-semibold">✓ Correct!</p>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-red-400 text-sm font-semibold">✗ Incorrect</p>
              <p className="text-purple-300 text-xs">
                Correct answer:{' '}
                <code className="font-mono text-yellow-300 px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.4)' }}>
                  {correctAnswer}
                </code>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hint: typing instruction */}
      {!revealed && (
        <p className="text-xs text-purple-500 text-center">
          Type the missing code, then press <kbd className="px-1 py-0.5 rounded text-purple-400 font-mono"
            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.3)' }}>
            Submit
          </kbd>
        </p>
      )}
    </div>
  )
}
