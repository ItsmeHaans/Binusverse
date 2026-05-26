import prisma from '../prisma';
import { Difficulty } from '@prisma/client';

export const quizRepository = {
  findTodayQuiz(quizDate: string) {
    return prisma.dailyQuiz.findUnique({
      where: { quizDate },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { question: true },
        },
      },
    });
  },

  findSubmission(userId: string, quizId: string) {
    return prisma.dailyQuizSubmission.findUnique({
      where: { userId_quizId: { userId, quizId } },
    });
  },

  createSubmission(data: {
    userId: string;
    quizId: string;
    correct: number;
    wrong: number;
    avgTime: number;
    xpGained: number;
  }) {
    return prisma.dailyQuizSubmission.create({ data });
  },

  getQuestionsByDifficulty(difficulty: Difficulty, count: number) {
    return prisma.question.findMany({
      where: { difficulty },
      take: count,
      orderBy: { createdAt: 'asc' },
    });
  },

  createQuestion(data: {
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    topic: string;
    difficulty: Difficulty;
  }) {
    return prisma.question.create({ data });
  },

  createDailyQuiz(quizDate: string, questionIds: string[]) {
    return prisma.dailyQuiz.create({
      data: {
        quizDate,
        questions: {
          create: questionIds.map((questionId, i) => ({ questionId, order: i + 1 })),
        },
      },
    });
  },
};
