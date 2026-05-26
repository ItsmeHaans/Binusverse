export function calcNewStreak(currentStreak: number, lastActiveAt: Date | null): number {
  if (!lastActiveAt) return 1;

  const now = new Date();
  const last = new Date(lastActiveAt);

  const todayStr = now.toISOString().split('T')[0];
  const lastStr = last.toISOString().split('T')[0];

  if (todayStr === lastStr) return currentStreak;

  const diffMs = now.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays === 1) return currentStreak + 1;
  return 1;
}
