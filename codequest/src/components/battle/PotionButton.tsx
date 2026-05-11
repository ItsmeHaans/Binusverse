import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ItemId } from '../../types'

interface PotionButtonProps {
  hpPotionCount: number
  hpPotionXLCount: number
  playerHP: number
  onUse: (type: Extract<ItemId, 'hp_potion' | 'hp_potion_xl'>) => void
  disabled?: boolean
}

export default function PotionButton({
  hpPotionCount,
  hpPotionXLCount,
  playerHP,
  onUse,
  disabled = false,
}: PotionButtonProps) {
  const [open, setOpen] = useState(false)

  const totalPotions = hpPotionCount + hpPotionXLCount
  const hpFull = playerHP >= 100
  const canUse = !disabled && !hpFull && totalPotions > 0

  if (totalPotions === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold opacity-40"
        style={{ background: 'rgba(55,65,81,0.4)', border: '1px solid rgba(107,114,128,0.3)', color: '#6b7280' }}>
        <span>🧪</span>
        <span>0</span>
      </div>
    )
  }

  function handleUse(type: 'hp_potion' | 'hp_potion_xl') {
    onUse(type)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => canUse && setOpen(p => !p)}
        disabled={!canUse}
        title={hpFull ? 'HP is already full' : `Use a potion (${totalPotions} remaining)`}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold
                    transition-all duration-150
                    ${canUse ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
        style={canUse
          ? { background: 'rgba(5,150,105,0.25)', border: '1px solid rgba(52,211,153,0.5)', color: '#6ee7b7' }
          : { background: 'rgba(55,65,81,0.4)', border: '1px solid rgba(107,114,128,0.3)', color: '#6b7280' }}>
        <span>🧪</span>
        <span>{totalPotions}</span>
        {canUse && <span className="text-xs opacity-70">{open ? '▲' : '▼'}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute bottom-full left-0 mb-2 flex flex-col gap-2 z-20"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}>

            {hpPotionXLCount > 0 && (
              <PotionOption
                emoji="⚗️"
                label="HP Potion XL"
                restore={60}
                count={hpPotionXLCount}
                playerHP={playerHP}
                onClick={() => handleUse('hp_potion_xl')}
              />
            )}

            {hpPotionCount > 0 && (
              <PotionOption
                emoji="🧪"
                label="HP Potion"
                restore={30}
                count={hpPotionCount}
                playerHP={playerHP}
                onClick={() => handleUse('hp_potion')}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface PotionOptionProps {
  emoji: string
  label: string
  restore: number
  count: number
  playerHP: number
  onClick: () => void
}

function PotionOption({ emoji, label, restore, count, playerHP, onClick }: PotionOptionProps) {
  const newHP = Math.min(100, playerHP + restore)
  const actualRestore = newHP - playerHP

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left
                 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
      style={{
        background: 'linear-gradient(135deg,rgba(5,150,105,0.3),rgba(4,120,87,0.3))',
        border: '1px solid rgba(52,211,153,0.5)',
        boxShadow: '0 4px 16px rgba(52,211,153,0.15)',
      }}>
      <span className="text-xl">{emoji}</span>
      <div>
        <p className="text-xs font-bold text-green-300">{label}</p>
        <p className="text-xs text-green-400">+{actualRestore} HP → {newHP}/100</p>
      </div>
      <span className="ml-auto text-xs text-green-500 font-semibold">×{count}</span>
    </button>
  )
}
