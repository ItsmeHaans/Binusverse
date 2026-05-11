import { useGame } from '../context/GameContext'
import { getLevelMeta } from '../data/levels'
import type { LevelNumber } from '../types'

const LEVEL_NUMBER: LevelNumber = 1

// Horizontal offsets for the winding path (index = node order, bottom→top)
const OFFSETS = ['translate-x-0', 'translate-x-16', '-translate-x-16', 'translate-x-16', 'translate-x-0']

export default function WorldMapScreen() {
  const { state, dispatch } = useGame()
  const levelMeta = getLevelMeta(LEVEL_NUMBER)
  const levelKey = `level_${LEVEL_NUMBER}`
  const stars = state.save.progress[levelKey]?.stars ?? {}

  // Node definitions: scroll first, then sub-levels, then boss
  const nodes = [
    { id: 'scroll', label: 'Scroll of Knowledge', sublabel: levelMeta.scrollTitle, icon: '📜', isBoss: false, isScroll: true },
    ...levelMeta.subLevels
      .filter(s => !s.isBoss)
      .map(s => ({ id: s.id, label: `Sub-level ${s.id}`, sublabel: 'Minion Battle', icon: '⚔️', isBoss: false, isScroll: false })),
    { id: 'boss', label: levelMeta.boss, sublabel: 'Boss Battle', icon: '👺', isBoss: true, isScroll: false },
  ]

  function getStatus(id: string): 'completed' | 'available' | 'locked' {
    if (id === 'scroll') return stars['scroll'] ? 'completed' : 'available'
    const order = ['scroll', '1.1', '1.2', '1.3', 'boss']
    const idx = order.indexOf(id)
    const allPrevDone = order.slice(0, idx).every(prev => !!stars[prev])
    if (stars[id]) return 'completed'
    if (allPrevDone) return 'available'
    return 'locked'
  }

  function handleNodeClick(id: string, isBoss: boolean, isScroll: boolean) {
    const status = getStatus(id)
    if (status === 'locked') return

    if (isScroll) {
      dispatch({ type: 'SET_BATTLE_CONTEXT', context: { levelNumber: LEVEL_NUMBER, subLevelId: 'scroll', isBoss: false } })
      dispatch({ type: 'NAVIGATE', screen: 'scroll' })
      return
    }

    dispatch({ type: 'SET_BATTLE_CONTEXT', context: { levelNumber: LEVEL_NUMBER, subLevelId: id, isBoss } })
    dispatch({ type: 'NAVIGATE', screen: 'battle' })
  }

  const totalStars = Object.values(stars).reduce<number>((sum, s) => sum + (s as number), 0)
  const maxStars = (levelMeta.subLevels.length + 1) * 3 // sub-levels + boss
  const progressPct = Math.round((totalStars / maxStars) * 100)

  // Render nodes bottom→top visually (reverse the array)
  const displayNodes = [...nodes].reverse()

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0f0c29 0%, #1a0533 60%, #0f1a0c 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'rgba(167,139,250,0.2)', background: 'rgba(15,12,41,0.8)' }}>
        <div>
          <p className="text-xs text-purple-400 uppercase tracking-widest">Level {LEVEL_NUMBER}</p>
          <h2 className="text-lg font-bold text-yellow-400">{levelMeta.world}</h2>
          <p className="text-xs text-purple-300">{levelMeta.concept}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'inventory' })}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-purple-200 cursor-pointer transition hover:scale-105"
            style={{ background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(167,139,250,0.4)' }}>
            🎒 Inventory
          </button>
          <p className="text-xs text-yellow-400">⭐ {totalStars} / {maxStars}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #7c3aed, #fbbf24)' }} />
          </div>
          <span className="text-xs text-purple-300 w-10 text-right">{progressPct}%</span>
        </div>
      </div>

      {/* Map path */}
      <div className="flex-1 flex flex-col items-center justify-end py-8 relative overflow-hidden">
        {/* Vertical guide line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2"
          style={{ background: 'rgba(167,139,250,0.15)' }} />

        <div className="flex flex-col items-center gap-0 w-full max-w-xs">
          {displayNodes.map((node, i) => {
            const status = getStatus(node.id)
            const nodeStars = stars[node.id] as number | undefined
            const offsetClass = OFFSETS[displayNodes.length - 1 - i] ?? 'translate-x-0'

            return (
              <div key={node.id} className="flex flex-col items-center w-full">
                {/* Connector line (not for last / bottom-most node) */}
                {i < displayNodes.length - 1 && (
                  <div className="w-1 h-8"
                    style={{ background: status === 'completed' ? 'rgba(167,139,250,0.5)' : 'rgba(167,139,250,0.15)' }} />
                )}

                {/* Node */}
                <div className={`transform ${offsetClass} transition-transform`}>
                  <button
                    onClick={() => handleNodeClick(node.id, node.isBoss, node.isScroll)}
                    disabled={status === 'locked'}
                    className={`
                      relative flex flex-col items-center gap-1 rounded-2xl px-4 py-3 min-w-32
                      transition-all duration-200 cursor-pointer
                      ${status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
                    `}
                    style={nodeStyle(node.isBoss, node.isScroll, status)}>

                    {/* Glow ring for available */}
                    {status === 'available' && (
                      <div className="absolute inset-0 rounded-2xl animate-pulse"
                        style={{ boxShadow: '0 0 20px rgba(251,191,36,0.6)', border: '2px solid rgba(251,191,36,0.8)' }} />
                    )}

                    <span className={node.isBoss ? 'text-4xl' : 'text-3xl'}>{node.icon}</span>
                    <span className="text-xs font-bold text-white text-center leading-tight">{node.label}</span>
                    <span className="text-xs text-purple-300 text-center">{node.sublabel}</span>

                    {/* Stars */}
                    {nodeStars && (
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3].map(n => (
                          <span key={n} className={`text-sm ${n <= nodeStars ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                        ))}
                      </div>
                    )}

                    {/* Lock icon */}
                    {status === 'locked' && (
                      <span className="absolute -top-2 -right-2 text-base">🔒</span>
                    )}

                    {/* Completed checkmark */}
                    {status === 'completed' && !nodeStars && (
                      <span className="text-green-400 text-sm">✓</span>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Player info footer */}
      <div className="px-4 py-3 flex items-center justify-between border-t"
        style={{ borderColor: 'rgba(167,139,250,0.2)', background: 'rgba(15,12,41,0.8)' }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧙</span>
          <div>
            <p className="text-sm font-bold text-white">{state.save.player.name}</p>
            <p className="text-xs text-purple-400">HP: {state.save.player.hp} / 100</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs text-purple-400">
          {state.save.player.inventory.map(item => (
            <span key={item} title={item}>{ITEM_EMOJI[item] ?? '?'}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function nodeStyle(isBoss: boolean, isScroll: boolean, status: string): React.CSSProperties {
  if (status === 'locked') {
    return { background: 'rgba(55,65,81,0.6)', border: '2px solid rgba(107,114,128,0.4)' }
  }
  if (isScroll) {
    return {
      background: 'linear-gradient(135deg, #1e3a5f, #1e4d8c)',
      border: '2px solid rgba(96,165,250,0.7)',
      boxShadow: status === 'available' ? '0 0 16px rgba(96,165,250,0.4)' : 'none',
    }
  }
  if (isBoss) {
    return {
      background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
      border: '2px solid rgba(252,165,165,0.7)',
      boxShadow: status === 'available' ? '0 0 16px rgba(239,68,68,0.5)' : 'none',
    }
  }
  if (status === 'completed') {
    return {
      background: 'linear-gradient(135deg, #14532d, #166534)',
      border: '2px solid rgba(74,222,128,0.6)',
    }
  }
  return {
    background: 'linear-gradient(135deg, #4c1d95, #5b21b6)',
    border: '2px solid rgba(167,139,250,0.6)',
    boxShadow: '0 0 16px rgba(124,58,237,0.4)',
  }
}

const ITEM_EMOJI: Record<string, string> = {
  wooden_sword: '🗡️',
  iron_shield: '🛡️',
  hp_potion: '🧪',
  knight_armor: '🛡️',
  fire_sword: '🔥',
  hp_potion_xl: '⚗️',
}
