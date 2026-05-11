import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { useSave } from '../hooks/useSave'
import { getLevelMeta } from '../data/levels'
import StarRating from '../components/ui/StarRating'
import type { LevelNumber } from '../types'

const ITEM_META: Record<string, { name: string; emoji: string; description: string }> = {
  wooden_sword:  { name: 'Wooden Sword',    emoji: '🗡️',  description: '+5 bonus damage to bosses' },
  iron_shield:   { name: 'Iron Shield',     emoji: '🛡️',  description: 'Blocks 1 boss hit per battle' },
  hp_potion:     { name: 'HP Potion',       emoji: '🧪',  description: 'Restores 30 HP (manual use)' },
  knight_armor:  { name: 'Knight Armor',    emoji: '🛡️',  description: 'Reduces all damage by 5' },
  fire_sword:    { name: 'Fire Sword',      emoji: '🔥',  description: '+10 bonus damage to bosses' },
  hp_potion_xl:  { name: 'HP Potion XL',    emoji: '⚗️',  description: 'Restores 60 HP (manual use)' },
}

const BADGE_META: Record<string, { name: string; emoji: string }> = {
  code_beginner:  { name: 'Code Beginner',  emoji: '🎖️' },
  logic_master:   { name: 'Logic Master',   emoji: '🎖️' },
  function_hero:  { name: 'Function Hero',  emoji: '🎖️' },
  code_champion:  { name: 'Code Champion',  emoji: '🏆' },
}

export default function RewardScreen() {
  const { state, dispatch } = useGame()
  const { save } = useSave()
  const dispatched = useRef(false)

  const context = state.battleContext!
  const levelNumber = context.levelNumber as LevelNumber
  const levelMeta   = getLevelMeta(levelNumber)
  const levelKey    = `level_${levelNumber}`
  const progress    = state.save.progress[levelKey]

  // ── Check bonus badge eligibility ──────────────────────────────────────────
  const allSubLevelIds = levelMeta.subLevels.map(s => s.id)
  const allPerfect = allSubLevelIds.every(id => progress?.stars[id] === 3)
  const bonusBadgeId = allPerfect ? (levelMeta.bonusBadge ?? null) : null
  const bonusBadgeAlreadyOwned = bonusBadgeId ? state.save.badges.includes(bonusBadgeId) : false
  const showBonusBadge = !!(bonusBadgeId && !bonusBadgeAlreadyOwned)

  // ── Dispatch rewards exactly once on mount ──────────────────────────────────
  useEffect(() => {
    if (dispatched.current) return
    dispatched.current = true

    for (const item of levelMeta.rewardItems) {
      dispatch({ type: 'ADD_ITEM', item })
    }

    if (showBonusBadge && bonusBadgeId) {
      dispatch({ type: 'ADD_BADGE',     badge: bonusBadgeId })
      dispatch({ type: 'UNLOCK_BONUS',  levelKey })
    }

    if (levelNumber < 6) {
      dispatch({ type: 'COMPLETE_LEVEL', levelNumber })
    }

    // save() must run after dispatches — use timeout to let state settle
    const t = setTimeout(() => save(), 50)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Level star summary ─────────────────────────────────────────────────────
  const starEntries = allSubLevelIds.map(id => ({
    id,
    stars: (progress?.stars[id] ?? 0) as number,
    isBoss: levelMeta.subLevels.find(s => s.id === id)?.isBoss ?? false,
  }))

  const [showContinue, setShowContinue] = useState(false)
  const totalItems = levelMeta.rewardItems.length + (showBonusBadge ? 1 : 0)
  const revealDelay = 0.6 + totalItems * 0.3

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6 gap-6 overflow-y-auto"
      style={{ background: 'linear-gradient(180deg,#0f0c29 0%,#1a0533 60%,#0f0c29 100%)' }}>

      {/* Header */}
      <motion.div className="flex flex-col items-center gap-2 text-center pt-2"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="text-5xl">🏆</span>
        <h1 className="text-3xl font-black text-yellow-400"
          style={{ textShadow: '0 0 24px rgba(251,191,36,0.5)' }}>
          Level {levelNumber} Complete!
        </h1>
        <p className="text-purple-300 text-sm font-semibold">{levelMeta.boss} has been defeated!</p>
      </motion.div>

      {/* Rewards section */}
      {levelMeta.rewardItems.length > 0 && (
        <motion.div className="w-full max-w-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold mb-3 text-center">
            Items Received
          </p>
          <div className="flex flex-col gap-3">
            {levelMeta.rewardItems.map((itemId, i) => {
              const meta = ITEM_META[itemId]
              return (
                <motion.div key={itemId}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4"
                  style={{
                    background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(76,29,149,0.2))',
                    border: '2px solid rgba(167,139,250,0.5)',
                    boxShadow: '0 0 20px rgba(124,58,237,0.25)',
                  }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.25, type: 'spring', stiffness: 300, damping: 24 }}>
                  <span className="text-4xl">{meta?.emoji ?? '❓'}</span>
                  <div>
                    <p className="font-black text-white">{meta?.name ?? itemId}</p>
                    <p className="text-xs text-purple-300">{meta?.description}</p>
                  </div>
                  <span className="ml-auto text-green-400 font-bold text-sm">NEW</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Bonus badge */}
      <AnimatePresence>
        {showBonusBadge && bonusBadgeId && (
          <motion.div
            className="w-full max-w-sm rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(234,179,8,0.1))',
              border: '2px solid rgba(251,191,36,0.6)',
              boxShadow: '0 0 24px rgba(251,191,36,0.3)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + levelMeta.rewardItems.length * 0.25, type: 'spring', stiffness: 280 }}>
            <span className="text-4xl">{BADGE_META[bonusBadgeId]?.emoji ?? '🎖️'}</span>
            <div>
              <p className="text-xs text-yellow-500 uppercase tracking-widest font-bold">Bonus Badge!</p>
              <p className="font-black text-yellow-300">{BADGE_META[bonusBadgeId]?.name ?? bonusBadgeId}</p>
              <p className="text-xs text-yellow-600">Earned by perfecting all sub-levels</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star summary */}
      <motion.div className="w-full max-w-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: revealDelay }}>
        <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold mb-3 text-center">
          Level {levelNumber} Stars
        </p>
        <div className="flex flex-col gap-2">
          {starEntries.map(entry => (
            <div key={entry.id}
              className="flex items-center justify-between rounded-xl px-4 py-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.15)' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{entry.isBoss ? '👺' : '⚔️'}</span>
                <span className="text-xs text-purple-300 font-semibold">
                  {entry.isBoss ? 'Boss' : `Sub-level ${entry.id}`}
                </span>
              </div>
              <StarRating stars={entry.stars} size="sm" animate={false} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Continue button */}
      <motion.div className="w-full max-w-sm pb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: revealDelay + 0.2 }}
        onAnimationComplete={() => setShowContinue(true)}>
        <button
          onClick={() => showContinue && dispatch({ type: 'NAVIGATE', screen: 'map' })}
          className={`w-full py-4 rounded-2xl font-black text-lg text-white tracking-wide
                      transition-all duration-200
                      ${showContinue ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-60 cursor-default'}`}
          style={{
            background: 'linear-gradient(135deg,#065f46,#047857)',
            border: '2px solid #34d399',
            boxShadow: showContinue ? '0 0 24px rgba(52,211,153,0.4)' : 'none',
          }}>
          🗺️ Continue to Map
        </button>
      </motion.div>
    </div>
  )
}
