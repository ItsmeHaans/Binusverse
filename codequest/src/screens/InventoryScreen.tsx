import { useGame } from '../context/GameContext'

export default function InventoryScreen() {
  const { dispatch } = useGame()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4">
      <div className="text-2xl">InventoryScreen — stub</div>
      <button
        onClick={() => dispatch({ type: 'NAVIGATE', screen: 'map' })}
        className="px-6 py-2 rounded-xl cursor-pointer"
        style={{ background: 'rgba(124,58,237,0.5)', border: '1px solid rgba(167,139,250,0.5)' }}>
        ← Back to Map
      </button>
    </div>
  )
}
