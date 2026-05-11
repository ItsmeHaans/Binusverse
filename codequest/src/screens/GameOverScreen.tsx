import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { useSave } from '../hooks/useSave'
import CharacterSprite from '../components/battle/CharacterSprite'

export default function GameOverScreen() {
  const { state, dispatch } = useGame()
  const { save } = useSave()
  const pendingNav = useRef(false)

  // After RESET_HP settles (hp=100), save then navigate — avoids stale closure
  useEffect(() => {
    if (pendingNav.current && state.save.player.hp === 100) {
      pendingNav.current = false
      save()
      dispatch({ type: 'NAVIGATE', screen: 'map' })
    }
  }, [state.save.player.hp]) // eslint-disable-line react-hooks/exhaustive-deps

  const context = state.battleContext
  const subLevelLabel = context
    ? `${context.isBoss ? 'Boss' : 'Sub-level'} ${context.subLevelId} · Level ${context.levelNumber}`
    : 'Unknown'

  function handleTryAgain() {
    pendingNav.current = true
    dispatch({ type: 'RESET_HP' })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#0a0005 0%,#1a000a 60%,#0a0005 100%)' }}>

      {/* Red vignette overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(180,0,0,0.35) 100%)' }} />

      {/* Fallen sprite */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}>
        <CharacterSprite
          character="player"
          spriteState="dead"
          bossLevel={context?.levelNumber ?? 1}
        />
      </motion.div>

      {/* Main text */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}>

        <h1 className="text-4xl font-black text-red-400"
          style={{ textShadow: '0 0 24px rgba(239,68,68,0.6)' }}>
          Byte has fallen…
        </h1>

        <p className="text-lg text-purple-300 font-semibold max-w-xs">
          But heroes never give up!
        </p>

        <p className="text-sm text-purple-500 max-w-xs leading-relaxed">
          The kingdom of Logica still needs you. Study what went wrong and return stronger!
        </p>
      </motion.div>

      {/* Stats panel */}
      <motion.div
        className="relative z-10 rounded-2xl px-6 py-4 w-full max-w-xs flex flex-col gap-2"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.3)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}>

        <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold mb-1">
          Battle Report
        </p>

        <StatRow label="Fell at" value={subLevelLabel} />
        <StatRow label="HP remaining" value="0 / 100" valueColor="#f87171" />
        <StatRow
          label="Items kept"
          value={
            state.save.player.inventory.length > 0
              ? state.save.player.inventory.map(i => ITEM_EMOJI[i] ?? '?').join(' ')
              : 'None'
          }
        />
        <StatRow
          label="Stars earned"
          value={Object.values(state.save.progress)
            .flatMap(p => Object.values(p.stars))
            .reduce<number>((sum, s) => sum + (s as number), 0)
            .toString() + ' ⭐'}
        />
      </motion.div>

      {/* Try Again button */}
      <motion.button
        onClick={handleTryAgain}
        className="relative z-10 w-full max-w-xs py-4 rounded-2xl font-black text-lg text-white
                   cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg,#7c3aed,#4c1d95)',
          border: '2px solid rgba(167,139,250,0.7)',
          boxShadow: '0 0 24px rgba(124,58,237,0.5)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}>
        ⚔️ Try Again
      </motion.button>

      <motion.p
        className="relative z-10 text-xs text-purple-600 text-center max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}>
        Your items and earned stars are safe.
        You'll restart from the map.
      </motion.p>
    </div>
  )
}

function StatRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-purple-400">{label}</span>
      <span className="text-xs font-semibold text-right" style={{ color: valueColor ?? '#e9d5ff' }}>
        {value}
      </span>
    </div>
  )
}

const ITEM_EMOJI: Record<string, string> = {
  wooden_sword:  '🗡️',
  iron_shield:   '🛡️',
  hp_potion:     '🧪',
  knight_armor:  '🛡️',
  fire_sword:    '🔥',
  hp_potion_xl:  '⚗️',
}
