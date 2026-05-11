import type { SaveData } from '../types'

const SAVE_KEY = 'codequest_save'
const SAVE_VERSION = 1

interface VersionedSave {
  version: number
  data: SaveData
}

export function persistSave(save: SaveData): void {
  try {
    const versioned: VersionedSave = { version: SAVE_VERSION, data: save }
    localStorage.setItem(SAVE_KEY, JSON.stringify(versioned))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed: VersionedSave = JSON.parse(raw)
    if (parsed.version !== SAVE_VERSION) return null
    return parsed.data
  } catch {
    return null
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}
