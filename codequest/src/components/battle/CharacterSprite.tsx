import { motion, AnimatePresence } from 'framer-motion'

export type SpriteState = 'idle' | 'attack' | 'hurt' | 'dead'

interface CharacterSpriteProps {
  character: 'player' | 'minion' | 'boss'
  spriteState: SpriteState
  bossLevel?: number
  flip?: boolean       // mirror horizontally (enemy side)
}

// Emoji placeholder sprites — replaced by real sprite sheets in Phase 4
const PLAYER_EMOJI = '🧙'

const BOSS_EMOJI: Record<number, string> = {
  1: '👺',
  2: '🗿',
  3: '🐉',
  4: '🦅',
  5: '🥷',
  6: '💀',
}

const MINION_EMOJI: Record<number, string> = {
  1: '👾',
  2: '🪨',
  3: '🐍',
  4: '🔥',
  5: '🗡️',
  6: '☠️',
}

// Framer Motion variants per animation state
const playerVariants = {
  idle: {
    y: [0, -6, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
  attack: {
    x: [0, 40, 0],
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  hurt: {
    x: [0, -12, 8, -8, 0],
    filter: ['brightness(1)', 'brightness(3)', 'brightness(1)'],
    transition: { duration: 0.4 },
  },
  dead: {
    rotate: [0, -90],
    opacity: [1, 0],
    y: [0, 20],
    transition: { duration: 0.7, ease: 'easeIn' },
  },
}

const enemyVariants = {
  idle: {
    y: [0, -8, 0],
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
  },
  attack: {
    x: [0, -40, 0],
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  hurt: {
    x: [0, 12, -8, 8, 0],
    filter: ['brightness(1) saturate(1)', 'brightness(3) saturate(0)', 'brightness(1) saturate(1)'],
    transition: { duration: 0.4 },
  },
  dead: {
    scale: [1, 1.4, 0],
    opacity: [1, 0.8, 0],
    transition: { duration: 0.6, ease: 'easeIn' },
  },
}

export default function CharacterSprite({
  character,
  spriteState,
  bossLevel = 1,
  flip = false,
}: CharacterSpriteProps) {
  const isPlayer = character === 'player'
  const isBoss = character === 'boss'
  const emoji =
    isPlayer ? PLAYER_EMOJI :
    isBoss   ? (BOSS_EMOJI[bossLevel] ?? '👹') :
               (MINION_EMOJI[bossLevel] ?? '👾')

  const variants = isPlayer ? playerVariants : enemyVariants
  const size = isBoss ? 'text-7xl' : isPlayer ? 'text-6xl' : 'text-5xl'

  // Dead state uses AnimatePresence for exit animation
  if (spriteState === 'dead') {
    return (
      <AnimatePresence>
        <motion.div
          key="dead"
          className={`${size} select-none`}
          style={{ display: 'inline-block', transform: flip ? 'scaleX(-1)' : 'none' }}
          animate={variants.dead}
        >
          {emoji}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <motion.div
      className={`${size} select-none cursor-default`}
      style={{ display: 'inline-block', transform: flip ? 'scaleX(-1)' : 'none' }}
      animate={variants[spriteState]}
      key={spriteState}
    >
      {emoji}
    </motion.div>
  )
}
