/** Returns the new streak value based on when the user was last active. */
export const calculateNewStreak = (currentStreak: number, lastActiveAt: Date | null): number => {
  if (!lastActiveAt) return 1;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastStart = new Date(
    lastActiveAt.getFullYear(),
    lastActiveAt.getMonth(),
    lastActiveAt.getDate()
  );

  const diffDays = Math.round(
    (todayStart.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return currentStreak; // already active today
  if (diffDays === 1) return currentStreak + 1; // consecutive day
  return 1; // missed at least one day, reset
};

/** Returns today's date as YYYY-MM-DD string (UTC). */
export const todayDateString = (): string => {
  return new Date().toISOString().slice(0, 10);
};
