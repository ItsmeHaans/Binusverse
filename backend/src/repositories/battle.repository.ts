import prisma from '../prisma';
import { Difficulty, BattleMode, PvpStatus } from '@prisma/client';

export const battleRepository = {
  getQuestionsByDifficulty(difficulty: Difficulty, count: number) {
    return prisma.question.findMany({
      where: { difficulty },
      take: count,
      orderBy: { createdAt: 'asc' },
    });
  },

  createBattleResult(data: {
    userId: string;
    mode: BattleMode;
    difficulty?: Difficulty;
    correct: number;
    wrong: number;
    timeElapsed: number;
    xpGained: number;
    opponentId?: string;
  }) {
    return prisma.battleResult.create({ data });
  },

  getUserHistory(userId: string) {
    return prisma.battleResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  },

  createPvpSession(challengerId: string, opponentId: string) {
    return prisma.pvpSession.create({
      data: { challengerId, opponentId },
    });
  },

  findPvpSession(id: string) {
    return prisma.pvpSession.findUnique({
      where: { id },
      include: { answers: true },
    });
  },

  updatePvpSession(id: string, data: { status?: PvpStatus; winnerId?: string | null; endedAt?: Date }) {
    return prisma.pvpSession.update({ where: { id }, data });
  },

  createPvpAnswer(data: {
    sessionId: string;
    userId: string;
    questionId: string;
    answer: string;
    timeTaken: number;
    correct: boolean;
  }) {
    return prisma.pvpAnswer.create({ data });
  },

  getPvpAnswersByUser(sessionId: string, userId: string) {
    return prisma.pvpAnswer.findMany({ where: { sessionId, userId } });
  },
};
