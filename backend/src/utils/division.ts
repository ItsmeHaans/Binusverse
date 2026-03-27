const DIVISIONS = [
  { name: 'Bronze', minElo: 0 },
  { name: 'Silver', minElo: 1000 },
  { name: 'Gold', minElo: 1500 },
  { name: 'Platinum', minElo: 2000 },
  { name: 'Diamond', minElo: 2500 },
  { name: 'Mythic', minElo: 3000 },
] as const;

export const getDivisionFromElo = (elo: number): string => {
  let division = 'Bronze';
  for (const d of DIVISIONS) {
    if (elo >= d.minElo) division = d.name;
  }
  return division;
};

export const updateElo = (currentElo: number, won: boolean): number => {
  const change = won ? 25 : -20;
  return Math.max(0, currentElo + change);
};
