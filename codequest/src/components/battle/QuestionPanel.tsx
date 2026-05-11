import { useState, useEffect, useMemo } from 'react'
import type { Question } from '../../types'
import MultipleChoice from './MultipleChoice'
import DragAndDrop from './DragAndDrop'
import FillInBlank from './FillInBlank'

interface QuestionPanelProps {
  question: Question
  onAnswer: (correct: boolean) => void
  disabled?: boolean
}

function shuffleIndices(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

export default function QuestionPanel({ question, onAnswer, disabled = false }: QuestionPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [fillValue, setFillValue]         = useState('')
  const [currentOrder, setCurrentOrder]   = useState<number[]>([])
  const [revealed, setRevealed]           = useState(false)

  // Computed synchronously so DragAndDrop receives the correct array on first mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dndDefaultOrder = useMemo(
    () => (question.blocks ? shuffleIndices(question.blocks.length) : []),
    [question.id],
  )

  // Reset scalar state when question changes
  useEffect(() => {
    setSelectedIndex(null)
    setFillValue('')
    setRevealed(false)
    setCurrentOrder(dndDefaultOrder)
  }, [question.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function checkAnswer(): boolean {
    switch (question.type) {
      case 'multiple_choice':
        return selectedIndex === (question.correct_answer as number)
      case 'drag_and_drop':
        return arraysEqual(currentOrder, question.correct_order ?? [])
      case 'fill_in_blank':
        return fillValue.trim() === String(question.correct_answer).trim()
    }
  }

  const canSubmit = !revealed && !disabled && (
    question.type === 'multiple_choice' ? selectedIndex !== null :
    question.type === 'drag_and_drop'   ? currentOrder.length > 0 :
    fillValue.trim().length > 0
  )

  function handleSubmit() {
    if (!canSubmit) return
    const correct = checkAnswer()
    setRevealed(true)
    onAnswer(correct)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Question text */}
      <div className="rounded-xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)' }}>
        <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-2">
          {LABEL[question.type]}
        </p>
        <p className="text-white font-semibold text-base leading-snug whitespace-pre-line">
          {question.question}
        </p>
      </div>

      {question.type === 'multiple_choice' && (
        <MultipleChoice
          options={question.options ?? []}
          selectedIndex={selectedIndex}
          correctIndex={question.correct_answer as number}
          revealed={revealed}
          onSelect={setSelectedIndex}
        />
      )}

      {question.type === 'drag_and_drop' && (
        <DragAndDrop
          blocks={question.blocks ?? []}
          correctOrder={question.correct_order ?? []}
          revealed={revealed}
          defaultOrder={dndDefaultOrder}
          onOrderChange={setCurrentOrder}
        />
      )}

      {question.type === 'fill_in_blank' && (
        <FillInBlank
          codeTemplate={question.code_template ?? '___'}
          correctAnswer={String(question.correct_answer)}
          revealed={revealed}
          value={fillValue}
          onChange={setFillValue}
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-3 rounded-xl font-bold text-base tracking-wide transition-all duration-200
                    ${canSubmit ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
        style={canSubmit
          ? { background: 'linear-gradient(135deg,#7c3aed,#4c1d95)', border: '2px solid rgba(167,139,250,0.7)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }
          : { background: 'rgba(55,65,81,0.4)', border: '2px solid rgba(107,114,128,0.3)' }}>
        {revealed ? '⏳ Waiting…' : 'Submit ➤'}
      </button>
    </div>
  )
}

const LABEL: Record<Question['type'], string> = {
  multiple_choice: '📋 Multiple Choice',
  drag_and_drop:   '↕ Drag & Drop',
  fill_in_blank:   '✏️ Fill in the Blank',
}
