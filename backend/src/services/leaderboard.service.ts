import prisma from '../prismaClient';
import { todayDateString } from '../utils/streak';

export async function getLeaderboard(mode: string, limit: number) {
  if (mode === 'pvp') {
    const users = await prisma.user.findMany({
      orderBy: [{ eloPoints: 'desc' }, { level: 'desc' }],
      take: limit,
      select: {
        id: true, name: true, avatar: true, faculty: true,
        level: true, eloPoints: true, division: true, rank: true,
      },
    });
    return { entries: users.map((u, i) => ({ ...u, position: i + 1 })), mode: 'pvp' };
  }

  const today = todayDateString();
  const submissions = await prisma.dailyQuizSubmission.findMany({
    where: { quizDate: today },
    orderBy: [{ correct: 'desc' }, { avgTime: 'asc' }],
    take: limit,
    include: {
      user: { select: { id: true, name: true, avatar: true, faculty: true, level: true, division: true } },
    },
  });

  const entries = submissions.map((s, i) => ({
    position: i + 1,
    userId: s.userId,
    name: s.user.name,
    avatar: s.user.avatar,
    faculty: s.user.faculty,
    level: s.user.level,
    division: s.user.division,
    correct: s.correct,
    wrong: s.wrong,
    avgTime: Math.round(s.avgTime * 100) / 100,
  }));

  return { entries, mode: 'daily', date: today };
}
