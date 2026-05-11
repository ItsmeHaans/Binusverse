import type { LevelMeta } from '../types'

export const LEVELS: LevelMeta[] = [
  {
    level: 1,
    world: 'Green Forest',
    concept: 'Input / Output & Print',
    boss: 'Goblin Chaos',
    minionDamage: 10,
    bossDamage: 15,
    bossSpecialDamage: 0,
    hasSpecialAttack: false,
    rewardItems: ['wooden_sword'],
    bonusBadge: 'code_beginner',
    scrollTitle: 'The Spell of Speaking',
    subLevels: [
      { id: '1.1', isBoss: false, questionCount: 2 },
      { id: '1.2', isBoss: false, questionCount: 2 },
      { id: '1.3', isBoss: false, questionCount: 2 },
      { id: 'boss', isBoss: true,  questionCount: 3 },
    ],
  },
  {
    level: 2,
    world: 'Crystal Cave',
    concept: 'Arithmetic Operations',
    boss: 'Stone Golem',
    minionDamage: 12,
    bossDamage: 20,
    bossSpecialDamage: 0,
    hasSpecialAttack: false,
    rewardItems: ['iron_shield', 'hp_potion'],
    bonusBadge: null,
    scrollTitle: 'The Power of Numbers',
    subLevels: [
      { id: '2.1', isBoss: false, questionCount: 2 },
      { id: '2.2', isBoss: false, questionCount: 2 },
      { id: '2.3', isBoss: false, questionCount: 2 },
      { id: '2.4', isBoss: false, questionCount: 2 },
      { id: 'boss', isBoss: true,  questionCount: 3 },
    ],
  },
  {
    level: 3,
    world: 'Poison Swamp',
    concept: 'Selection (if-else)',
    boss: 'Poison Dragon',
    minionDamage: 15,
    bossDamage: 25,
    bossSpecialDamage: 50,
    hasSpecialAttack: true,
    rewardItems: ['knight_armor'],
    bonusBadge: 'logic_master',
    scrollTitle: 'The Path of Choices',
    subLevels: [
      { id: '3.1', isBoss: false, questionCount: 3 },
      { id: '3.2', isBoss: false, questionCount: 3 },
      { id: '3.3', isBoss: false, questionCount: 3 },
      { id: '3.4', isBoss: false, questionCount: 3 },
      { id: 'boss', isBoss: true,  questionCount: 3 },
    ],
  },
  {
    level: 4,
    world: 'Volcano Mountain',
    concept: 'Repetition (for / while)',
    boss: 'Fire Phoenix',
    minionDamage: 18,
    bossDamage: 28,
    bossSpecialDamage: 56,
    hasSpecialAttack: true,
    rewardItems: ['fire_sword', 'hp_potion_xl'],
    bonusBadge: null,
    scrollTitle: 'The Circle of Repetition',
    subLevels: [
      { id: '4.1', isBoss: false, questionCount: 3 },
      { id: '4.2', isBoss: false, questionCount: 3 },
      { id: '4.3', isBoss: false, questionCount: 3 },
      { id: '4.4', isBoss: false, questionCount: 3 },
      { id: '4.5', isBoss: false, questionCount: 3 },
      { id: 'boss', isBoss: true,  questionCount: 3 },
    ],
  },
  {
    level: 5,
    world: 'Shadow Fortress',
    concept: 'Functions',
    boss: 'Shadow Assassin',
    minionDamage: 20,
    bossDamage: 30,
    bossSpecialDamage: 60,
    hasSpecialAttack: true,
    rewardItems: [],
    bonusBadge: 'function_hero',
    scrollTitle: 'The Art of Skills',
    subLevels: [
      { id: '5.1', isBoss: false, questionCount: 3 },
      { id: '5.2', isBoss: false, questionCount: 3 },
      { id: '5.3', isBoss: false, questionCount: 3 },
      { id: '5.4', isBoss: false, questionCount: 3 },
      { id: '5.5', isBoss: false, questionCount: 3 },
      { id: 'boss', isBoss: true,  questionCount: 3 },
    ],
  },
  {
    level: 6,
    world: 'Dark Tower',
    concept: 'Arrays + Mixed Concepts',
    boss: 'Dark Lord Syntax',
    minionDamage: 20,
    bossDamage: 35,
    bossSpecialDamage: 70,
    hasSpecialAttack: true,
    rewardItems: [],
    bonusBadge: 'code_champion',
    scrollTitle: 'The Collection of Power',
    subLevels: [
      { id: '6.1', isBoss: false, questionCount: 3 },
      { id: '6.2', isBoss: false, questionCount: 3 },
      { id: '6.3', isBoss: false, questionCount: 3 },
      { id: '6.4', isBoss: false, questionCount: 3 },
      { id: '6.5', isBoss: false, questionCount: 3 },
      { id: 'boss', isBoss: true,  questionCount: 3 },
    ],
  },
]

export function getLevelMeta(levelNumber: number): LevelMeta {
  const meta = LEVELS.find(l => l.level === levelNumber)
  if (!meta) throw new Error(`No level metadata for level ${levelNumber}`)
  return meta
}

export function getSubLevelMeta(levelNumber: number, subLevelId: string) {
  const level = getLevelMeta(levelNumber)
  const sub = level.subLevels.find(s => s.id === subLevelId)
  if (!sub) throw new Error(`No sub-level ${subLevelId} in level ${levelNumber}`)
  return sub
}
