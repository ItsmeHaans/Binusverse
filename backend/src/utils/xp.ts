export function xpToLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export const XP_REWARDS = {
  dailyBase: 20,
  perCorrect: 10,
  raidEasy: 20,
  raidNormal: 35,
  raidHard: 50,
  perfect: 50,
  pvpWin: 50,
  pvpLoss: 10,
};
