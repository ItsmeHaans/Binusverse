import { motion } from 'framer-motion'

interface Props {
  levelNumber: number
}

const PALETTES: Record<number, { sky: string[]; ground: string; fog: string; accent: string }> = {
  1: { sky: ['#0a0e2a', '#141a3d', '#1e1f3b'], ground: '#0d1a0d', fog: 'rgba(20,40,20,0.4)', accent: '#2d5a1b' },
  2: { sky: ['#050515', '#0a0a25', '#141435'], ground: '#0a0a1a', fog: 'rgba(10,10,40,0.5)', accent: '#1a1a4a' },
  3: { sky: ['#050f05', '#0a1a0a', '#0f200f'], ground: '#081208', fog: 'rgba(10,30,10,0.4)', accent: '#1a3a12' },
  4: { sky: ['#1a0500', '#2a0800', '#1a0a00'], ground: '#1a0800', fog: 'rgba(60,15,0,0.4)', accent: '#3d1200' },
  5: { sky: ['#05000f', '#0a0018', '#100020'], ground: '#050010', fog: 'rgba(30,0,60,0.5)', accent: '#200040' },
  6: { sky: ['#050505', '#0a0a0a', '#101010'], ground: '#080808', fog: 'rgba(20,0,20,0.5)', accent: '#1a0a1a' },
}

export default function BattleBackground({ levelNumber }: Props) {
  const p = PALETTES[levelNumber] ?? PALETTES[1]

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Sky gradient */}
      <svg
        className="absolute inset-0 w-full h-full pixel-art"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.sky[0]} />
            <stop offset="50%" stopColor={p.sky[1]} />
            <stop offset="100%" stopColor={p.sky[2]} />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="400" height="220" fill="url(#skyGrad)" />

        {/* Stars */}
        {STARS.map((s, i) => (
          <rect key={i} x={s.x} y={s.y} width={s.size} height={s.size} fill="#ffffff" opacity={s.opacity} />
        ))}

        {/* Moon */}
        <rect x="316" y="20" width="20" height="20" fill="#f5f0c8" />
        <rect x="318" y="18" width="16" height="2"  fill="#f5f0c8" />
        <rect x="318" y="40" width="16" height="2"  fill="#f5f0c8" />
        <rect x="314" y="22" width="2"  height="16" fill="#f5f0c8" />
        <rect x="336" y="22" width="2"  height="16" fill="#f5f0c8" />
        {/* Moon crater */}
        <rect x="322" y="26" width="4" height="4" fill="#ddd8a0" />
        <rect x="328" y="32" width="2" height="2" fill="#ddd8a0" />

        {/* Far mountains (darkest, no parallax) */}
        {MOUNTAINS_FAR.map((m, i) => (
          <rect key={i} x={m.x} y={m.y} width={m.w} height={m.h} fill="#111825" />
        ))}

        {/* Ground base */}
        <rect x="0" y="210" width="400" height="90" fill={p.ground} />
        {/* Ground top edge highlight */}
        <rect x="0" y="208" width="400" height="4" fill={p.accent} />
        <rect x="0" y="206" width="400" height="2" fill="#1a3a10" opacity="0.5" />

        {/* Fog / mist layer */}
        <rect x="0" y="195" width="400" height="30" fill={p.fog} />
      </svg>

      {/* Mid trees — slow parallax */}
      <motion.div
        className="absolute bottom-0 w-full"
        style={{ height: '55%' }}
        animate={{ x: [0, -8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          className="absolute bottom-0 w-full pixel-art"
          viewBox="0 0 400 160"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {TREES_MID.map((t, i) => <PixelTree key={i} {...t} shade="mid" />)}
        </svg>
      </motion.div>

      {/* Near trees — faster parallax */}
      <motion.div
        className="absolute bottom-0 w-full"
        style={{ height: '45%' }}
        animate={{ x: [0, -14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          className="absolute bottom-0 w-full pixel-art"
          viewBox="0 0 400 130"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {TREES_NEAR.map((t, i) => <PixelTree key={i} {...t} shade="near" />)}
        </svg>
      </motion.div>

      {/* Scanlines */}
      <div className="absolute inset-0 scanlines pointer-events-none" />
    </div>
  )
}

function PixelTree({ x, trunkH, crownH, crownW, shade }: {
  x: number; trunkH: number; crownH: number; crownW: number; shade: 'mid' | 'near'
}) {
  const trunkColor = shade === 'near' ? '#1a0e05' : '#111008'
  const crownDark  = shade === 'near' ? '#0d2205' : '#091502'
  const crownMid   = shade === 'near' ? '#163310' : '#0e2208'
  const crownLight = shade === 'near' ? '#1f4018' : '#142c0e'

  const tw = 6
  const tx = x + Math.floor(crownW / 2) - Math.floor(tw / 2)

  return (
    <g>
      {/* Trunk */}
      <rect x={tx} y={130 - trunkH} width={tw} height={trunkH} fill={trunkColor} />
      {/* Crown layers */}
      {Array.from({ length: crownH }).map((_, row) => {
        const rowW = Math.max(4, crownW - row * 2)
        const rowX = x + Math.floor((crownW - rowW) / 2)
        const rowY = 130 - trunkH - (row + 1) * 8
        const fill = row === 0 ? crownDark : row === 1 ? crownMid : crownLight
        return <rect key={row} x={rowX} y={rowY} width={rowW} height={8} fill={fill} />
      })}
    </g>
  )
}

// ─── Static data ─────────────────────────────────────────────────────────────

const STARS = [
  { x: 10,  y: 12,  size: 2, opacity: 0.9 },
  { x: 34,  y: 5,   size: 1, opacity: 0.7 },
  { x: 58,  y: 18,  size: 2, opacity: 0.8 },
  { x: 80,  y: 8,   size: 1, opacity: 0.6 },
  { x: 105, y: 22,  size: 2, opacity: 0.9 },
  { x: 130, y: 6,   size: 1, opacity: 0.5 },
  { x: 155, y: 15,  size: 2, opacity: 0.8 },
  { x: 178, y: 30,  size: 1, opacity: 0.7 },
  { x: 200, y: 10,  size: 1, opacity: 0.6 },
  { x: 220, y: 42,  size: 2, opacity: 0.9 },
  { x: 240, y: 20,  size: 1, opacity: 0.5 },
  { x: 258, y: 50,  size: 2, opacity: 0.7 },
  { x: 275, y: 14,  size: 1, opacity: 0.8 },
  { x: 290, y: 38,  size: 2, opacity: 0.6 },
  { x: 302, y: 60,  size: 1, opacity: 0.5 },
  { x: 345, y: 10,  size: 2, opacity: 0.9 },
  { x: 360, y: 35,  size: 1, opacity: 0.7 },
  { x: 375, y: 18,  size: 2, opacity: 0.8 },
  { x: 392, y: 50,  size: 1, opacity: 0.6 },
  { x: 50,  y: 45,  size: 1, opacity: 0.4 },
  { x: 75,  y: 55,  size: 1, opacity: 0.5 },
  { x: 140, y: 48,  size: 1, opacity: 0.4 },
  { x: 195, y: 60,  size: 1, opacity: 0.3 },
]

const MOUNTAINS_FAR = [
  { x: 0,   y: 130, w: 80,  h: 80  },
  { x: 50,  y: 110, w: 90,  h: 100 },
  { x: 120, y: 120, w: 70,  h: 90  },
  { x: 170, y: 100, w: 100, h: 110 },
  { x: 250, y: 115, w: 80,  h: 95  },
  { x: 310, y: 105, w: 90,  h: 105 },
  { x: 370, y: 125, w: 60,  h: 85  },
]

const TREES_MID = [
  { x: 0,   trunkH: 40, crownH: 4, crownW: 28 },
  { x: 35,  trunkH: 50, crownH: 5, crownW: 32 },
  { x: 75,  trunkH: 38, crownH: 4, crownW: 26 },
  { x: 108, trunkH: 55, crownH: 6, crownW: 34 },
  { x: 150, trunkH: 44, crownH: 4, crownW: 28 },
  { x: 185, trunkH: 60, crownH: 6, crownW: 36 },
  { x: 228, trunkH: 42, crownH: 5, crownW: 30 },
  { x: 265, trunkH: 50, crownH: 5, crownW: 32 },
  { x: 302, trunkH: 38, crownH: 4, crownW: 26 },
  { x: 336, trunkH: 52, crownH: 5, crownW: 32 },
  { x: 372, trunkH: 46, crownH: 4, crownW: 28 },
]

const TREES_NEAR = [
  { x: 10,  trunkH: 55, crownH: 5, crownW: 34 },
  { x: 55,  trunkH: 65, crownH: 6, crownW: 38 },
  { x: 100, trunkH: 50, crownH: 5, crownW: 32 },
  { x: 148, trunkH: 70, crownH: 7, crownW: 40 },
  { x: 198, trunkH: 58, crownH: 6, crownW: 36 },
  { x: 245, trunkH: 62, crownH: 6, crownW: 36 },
  { x: 292, trunkH: 52, crownH: 5, crownW: 32 },
  { x: 340, trunkH: 68, crownH: 7, crownW: 40 },
]
