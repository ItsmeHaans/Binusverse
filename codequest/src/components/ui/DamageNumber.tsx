import { motion } from 'framer-motion'

interface DamageNumberProps {
  value: number
  variant: 'damage' | 'heal' | 'special'
  onComplete?: () => void
}

const STYLES = {
  damage:  { color: '#f87171', prefix: '-', glow: 'rgba(239,68,68,0.6)',   size: 'text-2xl' },
  heal:    { color: '#34d399', prefix: '+', glow: 'rgba(52,211,153,0.6)',  size: 'text-xl'  },
  special: { color: '#fb923c', prefix: '-', glow: 'rgba(249,115,22,0.8)',  size: 'text-3xl' },
}

export default function DamageNumber({ value, variant, onComplete }: DamageNumberProps) {
  const s = STYLES[variant]

  return (
    <motion.div
      className={`pointer-events-none select-none font-black ${s.size}`}
      style={{
        color: s.color,
        textShadow: `0 0 12px ${s.glow}, 0 2px 4px rgba(0,0,0,0.8)`,
        position: 'absolute',
        whiteSpace: 'nowrap',
      }}
      initial={{ opacity: 1, y: 0, scale: 0.6 }}
      animate={{ opacity: 0, y: -64, scale: 1.2 }}
      transition={{ duration: 1.1, ease: [0.2, 0.8, 0.4, 1] }}
      onAnimationComplete={onComplete}
    >
      {s.prefix}{value}
      {variant === 'special' && <span className="text-base ml-1">💥</span>}
    </motion.div>
  )
}
