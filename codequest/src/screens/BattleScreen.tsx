import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { useBattle } from '../hooks/useBattle'
import { getLevelMeta } from '../data/levels'
import HPBar from '../components/battle/HPBar'
import CharacterSprite, { type SpriteState } from '../components/battle/CharacterSprite'
import QuestionPanel from '../components/battle/QuestionPanel'
import FeedbackBox from '../components/battle/FeedbackBox'
import HintButton from '../components/battle/HintButton'
import PotionButton from '../components/battle/PotionButton'
import DamageNumber from '../components/ui/DamageNumber'

interface DmgEvent { id: number; value: number; variant: 'damage' | 'heal' | 'special' }
let dmgId = 0

const ANIM_DELAY_MS = 700   // how long before FeedbackBox appears

export default function BattleScreen() {
  const { state, dispatch } = useGame()
  const battle = useBattle()
  const context = state.battleContext!
  const levelMeta = getLevelMeta(context.levelNumber)

  const [playerSprite, setPlayerSprite] = useState<SpriteState>('idle')
  const [enemySprite,  setEnemySprite]  = useState<SpriteState>('idle')
  const [showFeedback, setShowFeedback] = useState(false)
  const [dmgNumbers,   setDmgNumbers]   = useState<DmgEvent[]>([])
  const [shake,        setShake]        = useState(false)

  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Phase: animating → schedule feedback ───────────────────────────────────
  useEffect(() => {
    if (battle.phase !== 'animating' || !battle.lastResult) return

    const r = battle.lastResult

    if (r.shieldBlocked) {
      setPlayerSprite('idle')
      setEnemySprite('attack')
    } else if (r.correct) {
      setPlayerSprite('attack')
      setEnemySprite(r.targetDefeated ? 'dead' : 'hurt')
    } else {
      setPlayerSprite('hurt')
      setEnemySprite('attack')
      if (r.damage > 0) {
        const variant = r.isSpecialAttack ? 'special' : 'damage'
        setDmgNumbers(prev => [...prev, { id: ++dmgId, value: r.damage, variant }])
        if (r.isSpecialAttack) {
          setShake(true)
          setTimeout(() => setShake(false), 600)
        }
      }
    }

    feedbackTimer.current = setTimeout(() => {
      setShowFeedback(true)
      setPlayerSprite('idle')
      setEnemySprite(r.targetDefeated ? 'dead' : 'idle')
    }, ANIM_DELAY_MS)

    return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }
  }, [battle.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Phase: victory / defeat → navigate ─────────────────────────────────────
  useEffect(() => {
    if (battle.phase === 'victory') {
      if (context.isBoss) {
        dispatch({ type: 'NAVIGATE', screen: 'reward' })
      } else {
        dispatch({ type: 'NAVIGATE', screen: 'map' })
      }
    }
    if (battle.phase === 'defeat') {
      dispatch({ type: 'NAVIGATE', screen: 'gameover' })
    }
  }, [battle.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswer(correct: boolean) {
    setShowFeedback(false)
    battle.submitAnswer(correct)
  }

  function handleContinue() {
    setShowFeedback(false)
    setPlayerSprite('idle')
    setEnemySprite('idle')
    battle.dismissFeedback()
  }

  const enemyName = context.isBoss
    ? levelMeta.boss
    : MINION_NAMES[context.levelNumber] ?? 'Minion'

  const enemyChar = context.isBoss ? 'boss' : 'minion'

  return (
    <motion.div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: BG[context.levelNumber] ?? BG[1] }}
      animate={shake ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <HintButton
          hintsUsed={battle.hintsUsed}
          hintText={battle.currentQuestion?.hint ?? ''}
          onUse={battle.useHint}
          disabled={battle.phase !== 'question'}
        />
        <div className="text-center">
          <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest">
            Level {context.levelNumber} · {context.isBoss ? 'Boss' : context.subLevelId}
          </p>
          <p className="text-xs text-yellow-400">{levelMeta.world}</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'map' })}
          className="text-purple-400 hover:text-white text-xs cursor-pointer transition px-2 py-1 rounded"
          style={{ background: 'rgba(124,58,237,0.2)' }}>
          ✕ Flee
        </button>
      </div>

      {/* ── Arena ── */}
      <div className="flex items-end justify-around px-4 py-3 shrink-0 relative"
        style={{ minHeight: 180 }}>

        {/* Player side */}
        <div className="flex flex-col items-center gap-2 w-36">
          <div className="relative flex items-end justify-center h-24">
            <CharacterSprite character="player" spriteState={playerSprite} bossLevel={context.levelNumber} />
          </div>
          <HPBar hp={battle.playerHP} label="Byte" align="left" />
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center gap-1 pb-6">
          <span className="text-2xl">⚔️</span>
          <span className="text-xs text-purple-500 font-bold">VS</span>
        </div>

        {/* Enemy side */}
        <div className="flex flex-col items-center gap-2 w-36 relative">
          <div className="relative flex items-end justify-center h-24">
            {/* Damage numbers */}
            <AnimatePresence>
              {dmgNumbers.map(d => (
                <DamageNumber
                  key={d.id}
                  value={d.value}
                  variant={d.variant}
                  onComplete={() => setDmgNumbers(prev => prev.filter(x => x.id !== d.id))}
                />
              ))}
            </AnimatePresence>
            <CharacterSprite
              character={enemyChar}
              spriteState={enemySprite}
              bossLevel={context.levelNumber}
              flip
            />
          </div>
          <HPBar
            hp={battle.targetHP}
            maxHp={battle.maxTargetHP}
            label={enemyName}
            align="right"
          />
        </div>
      </div>

      {/* ── Star progress (boss) ── */}
      {context.isBoss && (
        <div className="flex items-center justify-center gap-1 pb-1">
          {[1,2,3].map(n => (
            <span key={n} className="text-lg"
              style={{ color: n <= battle.stars ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}>
              ★
            </span>
          ))}
          <span className="text-xs text-purple-400 ml-1">current</span>
        </div>
      )}

      {/* ── Question area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {battle.currentQuestion && (
          <QuestionPanel
            key={battle.questionAttemptKey}
            question={battle.currentQuestion}
            onAnswer={handleAnswer}
            disabled={battle.phase !== 'question'}
          />
        )}
      </div>

      {/* ── Footer: Potion button ── */}
      <div className="px-4 py-3 flex items-center gap-3 shrink-0"
        style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <PotionButton
          hpPotionCount={state.save.player.potion_count.hp_potion}
          hpPotionXLCount={state.save.player.potion_count.hp_potion_xl}
          playerHP={battle.playerHP}
          onUse={battle.usePotion}
          disabled={battle.phase !== 'question'}
        />
        <div className="flex-1 flex items-center justify-end gap-3">
          <span className="text-xs text-purple-500">Wrong: {battle.wrongCount}</span>
          {battle.wrongStreak >= 1 && (
            <span className="text-xs text-orange-400 font-bold animate-pulse">
              ⚠ Streak: {battle.wrongStreak}
            </span>
          )}
        </div>
      </div>

      {/* ── Feedback overlay ── */}
      <AnimatePresence>
        {showFeedback && battle.lastResult && battle.currentQuestion && (
          <FeedbackBox
            correct={battle.lastResult.correct}
            explanation={battle.currentQuestion.explanation}
            correctAnswerDisplay={battle.correctAnswerDisplay}
            damageTaken={battle.lastResult.shieldBlocked ? 0 : battle.lastResult.damage}
            isSpecialAttack={battle.lastResult.isSpecialAttack}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const MINION_NAMES: Record<number, string> = {
  1: 'Forest Goblin',
  2: 'Cave Bat',
  3: 'Swamp Slug',
  4: 'Lava Sprite',
  5: 'Shadow Wisp',
  6: 'Dark Sentinel',
}

const BG: Record<number, string> = {
  1: 'linear-gradient(180deg,#0a1f0a 0%,#0f2a0f 50%,#0a1f0a 100%)',
  2: 'linear-gradient(180deg,#0a0f2a 0%,#0f1a3d 50%,#0a0f2a 100%)',
  3: 'linear-gradient(180deg,#0a1a0a 0%,#1a2a0a 50%,#0a1a0a 100%)',
  4: 'linear-gradient(180deg,#2a0a00 0%,#3d1500 50%,#2a0a00 100%)',
  5: 'linear-gradient(180deg,#0a000f 0%,#15002a 50%,#0a000f 100%)',
  6: 'linear-gradient(180deg,#0a0a0a 0%,#1a0a1a 50%,#0a0a0a 100%)',
}
