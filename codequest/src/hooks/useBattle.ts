import { useState, useMemo } from 'react'
import { useGame } from '../context/GameContext'
import { useSave } from './useSave'
import { getLevelMeta, getSubLevelMeta } from '../data/levels'
import type { Question, StarCount } from '../types'

// ─── JSON question banks ──────────────────────────────────────────────────────

import level1Raw from '../data/questions/level1.json'

interface QuestionBank {
  level: number
  sub_levels: Record<string, { topic: string; questions: Question[] }>
}

const BANKS: Record<number, QuestionBank> = {
  1: level1Raw as unknown as QuestionBank,
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type BattlePhase = 'question' | 'animating' | 'victory' | 'defeat'

export interface LastResult {
  correct: boolean
  damage: number
  isSpecialAttack: boolean
  targetDefeated: boolean
  shieldBlocked: boolean
}

export interface UseBattleReturn {
  phase: BattlePhase
  playerHP: number
  targetHP: number
  maxTargetHP: number
  currentQuestion: Question | null
  questionAttemptKey: number
  correctAnswerDisplay: string
  hintsUsed: number
  wrongCount: number
  wrongStreak: number
  lastResult: LastResult | null
  swordBonus: number
  stars: StarCount
  submitAnswer: (correct: boolean) => void
  useHint: () => void
  usePotion: (type: 'hp_potion' | 'hp_potion_xl') => void
  dismissFeedback: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcStars(wrongCount: number, hintsUsed: number): StarCount {
  const fromWrong: StarCount = wrongCount === 0 ? 3 : wrongCount === 1 ? 2 : 1
  const cap = Math.max(1, 3 - hintsUsed) as StarCount
  return Math.min(fromWrong, cap) as StarCount
}

function getCorrectAnswerDisplay(q: Question): string {
  switch (q.type) {
    case 'multiple_choice':
      return q.options?.[q.correct_answer as number] ?? ''
    case 'drag_and_drop':
      return (q.correct_order ?? []).map(i => q.blocks?.[i] ?? '').join(' → ')
    case 'fill_in_blank':
      return String(q.correct_answer)
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function drawQuestions(levelNumber: number, subLevelId: string, count: number): Question[] {
  const bank = BANKS[levelNumber]
  if (!bank) return []
  const pool = bank.sub_levels[subLevelId]?.questions ?? []
  const shuffled = shuffleArray(pool)
  // Draw `count` from pool; if pool is smaller, cycle through it
  const drawn: Question[] = []
  for (let i = 0; i < count; i++) {
    drawn.push(shuffled[i % shuffled.length])
  }
  return drawn
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBattle(): UseBattleReturn {
  const { state, dispatch } = useGame()
  const { save } = useSave()

  const context = state.battleContext
  if (!context) throw new Error('useBattle called without battleContext')

  const { levelNumber, subLevelId, isBoss } = context
  const levelMeta  = getLevelMeta(levelNumber)
  const subMeta    = getSubLevelMeta(levelNumber, subLevelId)
  const player     = state.save.player
  const inventory  = player.inventory

  const hasKnightArmor = inventory.includes('knight_armor')
  const hasFireSword   = inventory.includes('fire_sword')
  const hasWoodenSword = inventory.includes('wooden_sword')
  const swordBonus     = hasFireSword ? 10 : hasWoodenSword ? 5 : 0
  const maxTargetHP    = isBoss ? 3 : subMeta.questionCount

  // Questions drawn once on mount
  const questions = useMemo(
    () => drawQuestions(levelNumber, subLevelId, subMeta.questionCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelNumber, subLevelId],
  )

  const [playerHP,    setPlayerHP]    = useState(player.hp)
  const [targetHP,    setTargetHP]    = useState(maxTargetHP)
  const [qIndex,      setQIndex]      = useState(0)
  const [attemptKey,  setAttemptKey]  = useState(0)
  const [hintsUsed,   setHintsUsed]   = useState(0)
  const [wrongCount,  setWrongCount]  = useState(0)
  const [wrongStreak, setWrongStreak] = useState(0)
  const [shieldActive,setShieldActive]= useState(isBoss && inventory.includes('iron_shield'))
  const [phase,       setPhase]       = useState<BattlePhase>('question')
  const [lastResult,  setLastResult]  = useState<LastResult | null>(null)

  const currentQuestion = questions[qIndex % questions.length] ?? null
  const stars = calcStars(wrongCount, hintsUsed)
  const correctAnswerDisplay = currentQuestion ? getCorrectAnswerDisplay(currentQuestion) : ''

  // ── submitAnswer ────────────────────────────────────────────────────────────
  function submitAnswer(correct: boolean) {
    if (phase !== 'question') return

    if (correct) {
      const newTargetHP = targetHP - 1
      setTargetHP(newTargetHP)
      setWrongStreak(0)
      setLastResult({
        correct: true,
        damage: 1 + (isBoss ? swordBonus : 0),
        isSpecialAttack: false,
        targetDefeated: newTargetHP <= 0,
        shieldBlocked: false,
      })
      setPhase('animating')
      return
    }

    // Wrong answer ─────────────────────────────────────────────────────────
    setWrongCount(c => c + 1)
    const newStreak = wrongStreak + 1

    // Iron Shield blocks one boss hit
    if (shieldActive && isBoss) {
      setShieldActive(false)
      setWrongStreak(newStreak)
      setLastResult({ correct: false, damage: 0, isSpecialAttack: false, targetDefeated: false, shieldBlocked: true })
      setPhase('animating')
      return
    }

    const isSpecial = isBoss && levelNumber >= 3 && newStreak >= 2
    if (isSpecial) setWrongStreak(0)
    else           setWrongStreak(newStreak)

    const baseDamage = isBoss
      ? (isSpecial ? levelMeta.bossSpecialDamage : levelMeta.bossDamage)
      : levelMeta.minionDamage
    const effectiveDamage = Math.max(0, baseDamage - (hasKnightArmor ? 5 : 0))
    const newHP = Math.max(0, playerHP - effectiveDamage)

    setPlayerHP(newHP)
    setLastResult({ correct: false, damage: effectiveDamage, isSpecialAttack: isSpecial, targetDefeated: false, shieldBlocked: false })
    setPhase('animating')
  }

  // ── dismissFeedback ─────────────────────────────────────────────────────────
  function dismissFeedback() {
    if (!lastResult) return

    // ── Defeat ──────────────────────────────────────────────────────────────
    if (!lastResult.correct && playerHP <= 0) {
      dispatch({ type: 'SET_HP', hp: 0 })
      setPhase('defeat')
      return
    }

    // ── Victory ─────────────────────────────────────────────────────────────
    if (lastResult.correct && lastResult.targetDefeated) {
      const levelKey = `level_${levelNumber}`
      dispatch({ type: 'SAVE_SUB_LEVEL_STARS', levelKey, subLevelKey: subLevelId, stars })
      dispatch({ type: 'SET_HP', hp: playerHP })
      save()
      setPhase('victory')
      return
    }

    // ── Continue battle ──────────────────────────────────────────────────────
    if (lastResult.correct) {
      // Advance to next question after a correct hit on a non-defeated target
      setQIndex(i => i + 1)
      setAttemptKey(k => k + 1)
    }
    // Wrong answer: same question repeats (qIndex unchanged)

    setAttemptKey(k => k + 1)
    setLastResult(null)
    setPhase('question')
  }

  // ── useHint ─────────────────────────────────────────────────────────────────
  function useHint() {
    if (hintsUsed < 2) setHintsUsed(h => h + 1)
  }

  // ── usePotion ───────────────────────────────────────────────────────────────
  function usePotion(type: 'hp_potion' | 'hp_potion_xl') {
    if (playerHP >= 100) return
    const restore = type === 'hp_potion' ? 30 : 60
    const newHP = Math.min(100, playerHP + restore)
    setPlayerHP(newHP)
    dispatch({ type: 'USE_POTION', potion: type })
  }

  return {
    phase,
    playerHP,
    targetHP,
    maxTargetHP,
    currentQuestion,
    questionAttemptKey: attemptKey,
    correctAnswerDisplay,
    hintsUsed,
    wrongCount,
    wrongStreak,
    lastResult,
    swordBonus,
    stars,
    submitAnswer,
    useHint,
    usePotion,
    dismissFeedback,
  }
}
