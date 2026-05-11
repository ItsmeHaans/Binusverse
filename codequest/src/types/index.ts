// Screens
export type Screen =
  | 'title'
  | 'map'
  | 'scroll'
  | 'battle'
  | 'reward'
  | 'inventory'
  | 'gameover';

// Question types
export type QuestionType = 'multiple_choice' | 'drag_and_drop' | 'fill_in_blank';

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  hint: string;
  explanation: string;
  // multiple_choice
  options?: string[];
  correct_answer?: number | string;
  // drag_and_drop
  blocks?: string[];
  correct_order?: number[];
  // fill_in_blank
  code_template?: string;
}

// Battle
export type BattleTarget = 'minion' | 'boss';

export interface BattleState {
  playerHP: number;
  targetHP: number;
  targetType: BattleTarget;
  currentQuestion: Question | null;
  hintsUsed: number;
  wrongStreak: number;
  wrongCount: number;
  shieldActive: boolean;
  combatLog: string[];
}

// Items
export type ItemId =
  | 'wooden_sword'
  | 'iron_shield'
  | 'hp_potion'
  | 'knight_armor'
  | 'fire_sword'
  | 'hp_potion_xl';

export interface ItemDefinition {
  id: ItemId;
  name: string;
  description: string;
  emoji: string;
  autoUse: boolean;
}

// Stars
export type StarCount = 1 | 2 | 3;

// Level / sub-level identifiers
export type LevelNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface SubLevelMeta {
  id: string;           // e.g. "1.1", "1.2", "boss"
  isBoss: boolean;
  questionCount: number;
}

export interface LevelMeta {
  level: LevelNumber;
  world: string;
  concept: string;
  boss: string;
  minionDamage: number;
  bossDamage: number;
  bossSpecialDamage: number;
  hasSpecialAttack: boolean;
  rewardItems: ItemId[];
  bonusBadge: string | null;
  subLevels: SubLevelMeta[];
  scrollTitle: string;
}

// Save data
export interface SaveData {
  player: {
    name: string;
    current_level: LevelNumber;
    current_sub_level: string;
    hp: number;
    inventory: ItemId[];
    potion_count: { hp_potion: number; hp_potion_xl: number };
  };
  progress: {
    [levelKey: string]: {
      completed: boolean;
      stars: { [subLevelKey: string]: StarCount };
      bonus_unlocked: boolean;
    };
  };
  badges: string[];
  total_play_time_seconds: number;
}

// Navigation context passed to battle/scroll screens
export interface BattleContext {
  levelNumber: LevelNumber;
  subLevelId: string;
  isBoss: boolean;
}
