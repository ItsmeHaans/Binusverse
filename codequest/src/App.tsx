import { GameProvider, useGame } from './context/GameContext'
import TitleScreen from './screens/TitleScreen'
import WorldMapScreen from './screens/WorldMapScreen'
import ScrollScreen from './screens/ScrollScreen'
import BattleScreen from './screens/BattleScreen'
import RewardScreen from './screens/RewardScreen'
import InventoryScreen from './screens/InventoryScreen'
import GameOverScreen from './screens/GameOverScreen'

function Router() {
  const { state } = useGame()

  switch (state.screen) {
    case 'title':     return <TitleScreen />
    case 'map':       return <WorldMapScreen />
    case 'scroll':    return <ScrollScreen />
    case 'battle':    return <BattleScreen />
    case 'reward':    return <RewardScreen />
    case 'inventory': return <InventoryScreen />
    case 'gameover':  return <GameOverScreen />
    default:          return <TitleScreen />
  }
}

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  )
}
