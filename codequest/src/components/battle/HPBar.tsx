interface HPBarProps {
  hp: number
  maxHp?: number
  label: string
  align?: 'left' | 'right'
}

export default function HPBar({ hp, maxHp = 100, label, align = 'left' }: HPBarProps) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100))

  const barColor =
    pct > 60 ? '#22c55e' :
    pct > 30 ? '#eab308' :
               '#ef4444'

  const glowColor =
    pct > 60 ? 'rgba(34,197,94,0.4)' :
    pct > 30 ? 'rgba(234,179,8,0.4)' :
               'rgba(239,68,68,0.4)'

  return (
    <div className={`flex flex-col gap-1 w-full ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 w-full ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className="text-xs font-bold text-white truncate max-w-24">{label}</span>
        <span className="text-xs font-mono ml-auto" style={{ color: barColor }}>
          {hp}<span className="text-purple-500">/{maxHp}</span>
        </span>
      </div>

      <div className="w-full h-4 rounded-full overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
            boxShadow: `0 0 8px ${glowColor}`,
          }}
        />
      </div>

      {/* Low HP warning pulse */}
      {pct <= 30 && hp > 0 && (
        <p className="text-xs text-red-400 font-bold animate-pulse">⚠ Low HP!</p>
      )}
    </div>
  )
}
