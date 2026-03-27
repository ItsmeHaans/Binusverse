export const XP_REWARDS = {
  PVP_WIN: 50,
  PVP_LOSS: 10,
  DAILY_QUIZ: 30,
  RAID_EASY: 20,
  RAID_NORMAL: 35,
  RAID_HARD: 50,
} as const;

/** Level = floor(xp / 100) + 1. Every 100 XP = 1 level. */
export const getLevelFromXp = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

export const getXpToNextLevel = (currentLevel: number): number => {
  return currentLevel * 100 - (currentLevel - 1) * 100; // always 100
};
