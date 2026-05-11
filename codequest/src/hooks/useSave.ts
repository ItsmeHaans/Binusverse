import { useCallback, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { persistSave, loadSave, clearSave, hasSave } from '../utils/saveData'

export function useSave() {
  const { state, dispatch } = useGame()

  // Always-fresh ref so stale closures (useEffect, setTimeout) still write correct state
  const saveRef = useRef(state.save)
  saveRef.current = state.save

  const save = useCallback(() => {
    persistSave(saveRef.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback((): boolean => {
    const saved = loadSave()
    if (!saved) return false
    dispatch({ type: 'LOAD_SAVE', save: saved })
    return true
  }, [dispatch])

  const newGame = useCallback(() => {
    clearSave()
    dispatch({ type: 'NEW_GAME' })
  }, [dispatch])

  return {
    save,
    load,
    newGame,
    hasSave,
  }
}
