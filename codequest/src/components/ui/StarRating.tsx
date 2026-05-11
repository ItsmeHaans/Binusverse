import { motion } from 'framer-motion'

interface StarRatingProps {
  stars: number           // 1–3 earned
  maxStars?: number       // default 3
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean       // pop-in animation
  showLabel?: boolean
}

const LABELS: Record<number, { sub: string; boss: string }> = {
  3: { sub: 'Perfect!',         boss: 'Flawless Victory!' },
  2: { sub: 'Great!',           boss: 'Well Done!'        },
  1: { sub: 'Good!',            boss: 'Survived!'         },
}

const SIZES = {
  sm:  { star: 'text-lg',  gap: 'gap-0.5' },
  md:  { star: 'text-3xl', gap: 'gap-1'   },
  lg:  { star: 'text-5xl', gap: 'gap-2'   },
}

export default function StarRating({
  stars,
  maxStars = 3,
  size = 'md',
  animate = true,
  showLabel = false,
}: StarRatingProps) {
  const { star, gap } = SIZES[size]
  const clipped = Math.max(1, Math.min(maxStars, stars))
  const label = LABELS[clipped]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center ${gap}`}>
        {Array.from({ length: maxStars }, (_, i) => {
          const earned = i < clipped
          return animate ? (
            <motion.span
              key={i}
              className={`${star} select-none`}
              style={{ color: earned ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: i * 0.15,
                type: 'spring',
                stiffness: 400,
                damping: 18,
              }}
            >
              ★
            </motion.span>
          ) : (
            <span
              key={i}
              className={`${star} select-none`}
              style={{ color: earned ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}
            >
              ★
            </span>
          )
        })}
      </div>

      {showLabel && label && (
        <motion.p
          className="font-black text-yellow-400 text-sm tracking-wide"
          initial={animate ? { opacity: 0, y: 4 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: maxStars * 0.15 + 0.1 }}
        >
          {label.sub}
        </motion.p>
      )}
    </div>
  )
}
