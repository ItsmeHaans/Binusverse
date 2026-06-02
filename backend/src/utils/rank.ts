// XP-threshold rank — mirrors computeRank() in frontend user-data.js (FE is authoritative).
const RANKS: [number, string][] = [
  [100, 'Bronze'],
  [500, 'Silver'],
  [1200, 'Gold'],
  [2500, 'Platinum'],
  [4500, 'Diamond'],
  [7000, 'Legend'],
];

export function xpToRank(totalXp: number): string {
  for (const [threshold, label] of RANKS) {
    if (totalXp < threshold) return label;
  }
  return 'Legend';
}
