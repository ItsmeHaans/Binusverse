import { useState, useEffect } from 'react'
import { Reorder, useDragControls } from 'framer-motion'

interface DragAndDropProps {
  blocks: string[]
  correctOrder: number[]
  revealed: boolean
  onOrderChange: (orderedIndices: number[]) => void
  defaultOrder?: number[]   // shuffled starting arrangement from parent
}

export default function DragAndDrop({
  blocks,
  correctOrder,
  revealed,
  onOrderChange,
  defaultOrder,
}: DragAndDropProps) {
  // items = current sequence of block indices
  const [items, setItems] = useState<number[]>(() => defaultOrder ?? blocks.map((_, i) => i))

  // Reset when question changes — keep shuffled order from parent, sync back via callback
  useEffect(() => {
    const initial = defaultOrder ?? blocks.map((_, i) => i)
    setItems(initial)
    onOrderChange(initial)
  }, [blocks]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleReorder(newItems: number[]) {
    setItems(newItems)
    onOrderChange(newItems)
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-purple-400 text-center mb-1">
        {revealed ? 'Correct order shown below' : '↕ Drag blocks into the correct order'}
      </p>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="flex flex-col gap-2"
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
      >
        {items.map((blockIndex, position) => (
          <DragBlock
            key={blockIndex}
            blockIndex={blockIndex}
            position={position}
            text={blocks[blockIndex]}
            correctPosition={correctOrder.indexOf(blockIndex)}
            revealed={revealed}
            disabled={revealed}
          />
        ))}
      </Reorder.Group>

      {revealed && (
        <CorrectOrderHint blocks={blocks} correctOrder={correctOrder} currentItems={items} />
      )}
    </div>
  )
}

interface DragBlockProps {
  blockIndex: number
  position: number
  text: string
  correctPosition: number
  revealed: boolean
  disabled: boolean
}

function DragBlock({ blockIndex, position, text, correctPosition, revealed, disabled }: DragBlockProps) {
  const controls = useDragControls()
  const isCorrectPos = revealed && position === correctPosition

  const containerStyle: React.CSSProperties = revealed
    ? isCorrectPos
      ? { background: 'rgba(5,150,105,0.25)', border: '2px solid #34d399', boxShadow: '0 0 10px rgba(52,211,153,0.25)' }
      : { background: 'rgba(220,38,38,0.2)', border: '2px solid #f87171' }
    : { background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.4)', cursor: disabled ? 'default' : 'grab' }

  return (
    <Reorder.Item
      value={blockIndex}
      dragListener={!disabled}
      dragControls={controls}
      style={{ listStyle: 'none' }}
      whileDrag={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 10 }}
    >
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 select-none transition-colors duration-200"
        style={containerStyle}
        onPointerDown={e => !disabled && controls.start(e)}
      >
        {/* Drag handle / status icon */}
        <span className="text-sm shrink-0 w-5 text-center">
          {revealed
            ? isCorrectPos ? '✓' : '✗'
            : <GripIcon />}
        </span>

        {/* Line number */}
        <span className="text-xs font-mono shrink-0 w-4 text-right"
          style={{ color: revealed ? (isCorrectPos ? '#6ee7b7' : '#fca5a5') : '#6b7280' }}>
          {position + 1}
        </span>

        {/* Code text */}
        <code className="text-sm font-mono leading-snug flex-1"
          style={{ color: revealed ? (isCorrectPos ? '#a7f3d0' : '#fca5a5') : '#e9d5ff' }}>
          {text}
        </code>
      </div>
    </Reorder.Item>
  )
}

function CorrectOrderHint({ blocks, correctOrder, currentItems }: {
  blocks: string[]
  correctOrder: number[]
  currentItems: number[]
}) {
  const isFullyCorrect = correctOrder.every((idx, pos) => currentItems[pos] === idx)
  if (isFullyCorrect) return null

  return (
    <div className="mt-2 rounded-xl p-3"
      style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
      <p className="text-xs text-green-400 font-semibold mb-2">Correct order:</p>
      <div className="flex flex-col gap-1">
        {correctOrder.map((blockIdx, pos) => (
          <div key={pos} className="flex items-center gap-2">
            <span className="text-xs text-green-600 w-4 text-right font-mono">{pos + 1}.</span>
            <code className="text-xs font-mono text-green-300">{blocks[blockIdx]}</code>
          </div>
        ))}
      </div>
    </div>
  )
}

function GripIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" className="inline-block opacity-50">
      <circle cx="3" cy="2" r="1.2" fill="#9ca3af" />
      <circle cx="9" cy="2" r="1.2" fill="#9ca3af" />
      <circle cx="3" cy="7" r="1.2" fill="#9ca3af" />
      <circle cx="9" cy="7" r="1.2" fill="#9ca3af" />
      <circle cx="3" cy="12" r="1.2" fill="#9ca3af" />
      <circle cx="9" cy="12" r="1.2" fill="#9ca3af" />
    </svg>
  )
}
