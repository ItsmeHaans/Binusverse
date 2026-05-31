export function calcNewStreak(currentStreak: number, lastActiveAt: Date | null): number {
  if (!lastActiveAt) return 1;

  const now = new Date();
  const last = new Date(lastActiveAt);

  const nowMidnight  = Date.UTC(now.getUTCFullYear(),  now.getUTCMonth(),  now.getUTCDate());
  const lastMidnight = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());

  const diffDays = (nowMidnight - lastMidnight) / 86400000;

  if (diffDays === 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}
