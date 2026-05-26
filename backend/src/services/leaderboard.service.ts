import prisma from '../prisma';

export const leaderboardService = {
  async getPvpLeaderboard(limit: number = 50) {
    const users = await prisma.user.findMany({
      orderBy: [{ eloPoints: 'desc' }, { level: 'desc' }],
      take: limit,
      select: {
        id: true,
        name: true,
        avatar: true,
        level: true,
        eloPoints: true,
        division: true,
        faculty: true,
      },
    });

    return users.map((u, i) => ({ rank: i + 1, ...u }));
  },

  async getDailyLeaderboard(limit: number = 50) {
    const today = new Date().toISOString().split('T')[0]!;

    const submissions = await prisma.dailyQuizSubmission.findMany({
      where: { quiz: { quizDate: today } },
      orderBy: [{ correct: 'desc' }, { avgTime: 'asc' }],
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatar: true, level: true } },
      },
    });

    return submissions.map((s, i) => ({
      rank: i + 1,
      user: s.user,
      correct: s.correct,
      wrong: s.wrong,
      avgTime: s.avgTime,
      xpGained: s.xpGained,
    }));
  },
};
