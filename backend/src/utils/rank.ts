export function eloToDivision(elo: number): string {
  if (elo < 1000) return 'Bronze';
  if (elo < 1500) return 'Silver';
  if (elo < 2000) return 'Gold';
  if (elo < 2500) return 'Platinum';
  if (elo < 3000) return 'Diamond';
  return 'Legend';
}

export const ELO = {
  win: 25,
  loss: -20,
};
