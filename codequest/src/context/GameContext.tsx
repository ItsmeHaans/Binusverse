import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react'
import type {
  Screen,
  SaveData,
  ItemId,
  LevelNumber,
  StarCount,
  BattleContext,
} from '../types'

// ─── State ───────────────────────────────────────────────────────────────────

export interface GameState {
  screen: Screen
  battleContext: BattleContext | null
  save: SaveData
}

const DEFAULT_SAVE: SaveData = {
  player: {
    name: 'Byte',
    current_level: 1,
    current_sub_level: '1.1',
    hp: 100,
    inventory: [],
    potion_count: { hp_potion: 0, hp_potion_xl: 0 },
  },
  progress: {
    level_1: { completed: false, stars: {}, bonus_unlocked: false },
    level_2: { completed: false, stars: {}, bonus_unlocked: false },
    level_3: { completed: false, stars: {}, bonus_unlocked: false },
    level_4: { completed: false, stars: {}, bonus_unlocked: false },
    level_5: { completed: false, stars: {}, bonus_unlocked: false },
    level_6: { completed: false, stars: {}, bonus_unlocked: false },
  },
  badges: [],
  total_play_time_seconds: 0,
}

const INITIAL_STATE: GameState = {
  screen: 'title',
  battleContext: null,
  save: DEFAULT_SAVE,
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type GameAction =
  | { type: 'NAVIGATE'; screen: Screen }
  | { type: 'SET_BATTLE_CONTEXT'; context: BattleContext }
  | { type: 'SET_HP'; hp: number }
  | { type: 'RESET_HP' }
  | { type: 'ADD_ITEM'; item: ItemId }
  | { type: 'USE_POTION'; potion: 'hp_potion' | 'hp_potion_xl' }
  | { type: 'SAVE_SUB_LEVEL_STARS'; levelKey: string; subLevelKey: string; stars: StarCount }
  | { type: 'COMPLETE_LEVEL'; levelNumber: LevelNumber }
  | { type: 'UNLOCK_BONUS'; levelKey: string }
  | { type: 'ADD_BADGE'; badge: string }
  | { type: 'TICK_PLAY_TIME'; seconds: number }
  | { type: 'LOAD_SAVE'; save: SaveData }
  | { type: 'NEW_GAME' }

// ─── Reducer ─────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen }

    case 'SET_BATTLE_CONTEXT':
      return { ...state, battleContext: action.context }

    case 'SET_HP': {
      const hp = Math.max(0, Math.min(100, action.hp))
      return {
        ...state,
        save: { ...state.save, player: { ...state.save.player, hp } },
      }
    }

    case 'RESET_HP':
      return {
        ...state,
        save: { ...state.save, player: { ...state.save.player, hp: 100 } },
      }

    case 'ADD_ITEM': {
      const { item } = action
      const player = state.save.player
      // Replace wooden_sword if adding fire_sword
      const baseInventory = item === 'fire_sword'
        ? player.inventory.filter(i => i !== 'wooden_sword')
        : player.inventory
      // Don't duplicate permanent items
      if (baseInventory.includes(item) && item !== 'hp_potion' && item !== 'hp_potion_xl') {
        return state
      }
      if (item === 'hp_potion') {
        const count = Math.min(3, player.potion_count.hp_potion + 1)
        return {
          ...state,
          save: {
            ...state.save,
            player: { ...player, potion_count: { ...player.potion_count, hp_potion: count } },
          },
        }
      }
      if (item === 'hp_potion_xl') {
        const count = Math.min(2, player.potion_count.hp_potion_xl + 1)
        return {
          ...state,
          save: {
            ...state.save,
            player: { ...player, potion_count: { ...player.potion_count, hp_potion_xl: count } },
          },
        }
      }
      return {
        ...state,
        save: {
          ...state.save,
          player: { ...player, inventory: [...baseInventory, item] },
        },
      }
    }

    case 'USE_POTION': {
      const player = state.save.player
      if (player.hp >= 100) return state
      const restore = action.potion === 'hp_potion' ? 30 : 60
      const currentCount = player.potion_count[action.potion]
      if (currentCount <= 0) return state
      const newHP = Math.min(100, player.hp + restore)
      return {
        ...state,
        save: {
          ...state.save,
          player: {
            ...player,
            hp: newHP,
            potion_count: { ...player.potion_count, [action.potion]: currentCount - 1 },
          },
        },
      }
    }

    case 'SAVE_SUB_LEVEL_STARS': {
      const { levelKey, subLevelKey, stars } = action
      const levelProgress = state.save.progress[levelKey]
      const existingStars = levelProgress?.stars[subLevelKey] ?? 0
      if (stars <= existingStars) return state // stars never decrease
      return {
        ...state,
        save: {
          ...state.save,
          progress: {
            ...state.save.progress,
            [levelKey]: {
              ...levelProgress,
              stars: { ...levelProgress.stars, [subLevelKey]: stars },
            },
          },
        },
      }
    }

    case 'COMPLETE_LEVEL': {
      const levelKey = `level_${action.levelNumber}`
      const nextLevel = (action.levelNumber + 1) as LevelNumber
      return {
        ...state,
        save: {
          ...state.save,
          player: {
            ...state.save.player,
            current_level: Math.max(state.save.player.current_level, nextLevel) as LevelNumber,
            current_sub_level: `${nextLevel}.1`,
            hp: 100,
          },
          progress: {
            ...state.save.progress,
            [levelKey]: { ...state.save.progress[levelKey], completed: true },
          },
        },
      }
    }

    case 'UNLOCK_BONUS':
      return {
        ...state,
        save: {
          ...state.save,
          progress: {
            ...state.save.progress,
            [action.levelKey]: { ...state.save.progress[action.levelKey], bonus_unlocked: true },
          },
        },
      }

    case 'ADD_BADGE': {
      if (state.save.badges.includes(action.badge)) return state
      return {
        ...state,
        save: { ...state.save, badges: [...state.save.badges, action.badge] },
      }
    }

    case 'TICK_PLAY_TIME':
      return {
        ...state,
        save: {
          ...state.save,
          total_play_time_seconds: state.save.total_play_time_seconds + action.seconds,
        },
      }

    case 'LOAD_SAVE':
      return { ...state, save: action.save, screen: 'map' }

    case 'NEW_GAME':
      return { ...INITIAL_STATE, screen: 'map', save: { ...DEFAULT_SAVE } }

    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)

  // Play-time ticker: increment every 60 s while game is active (not on title)
  const screenRef = useRef(state.screen)
  screenRef.current = state.screen
  useEffect(() => {
    const id = setInterval(() => {
      if (screenRef.current !== 'title') {
        dispatch({ type: 'TICK_PLAY_TIME', seconds: 60 })
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
