import { quizRepository } from '../repositories/quiz.repository';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { XP_REWARDS, xpToLevel } from '../utils/xp';
import { calcNewStreak } from '../utils/streak';
import { Difficulty } from '@prisma/client';

const DAILY_Q_COUNT = 10;

export const quizService = {
  async getDaily(userId: string) {
    const today = new Date().toISOString().split('T')[0]!;
    let quiz = await quizRepository.findTodayQuiz(today);

    if (!quiz) {
      const qs = await quizRepository.getQuestionsByDifficulty(Difficulty.NORMAL, DAILY_Q_COUNT);
      if (qs.length < DAILY_Q_COUNT) throw new AppError('Not enough questions in bank', 503);
      await quizRepository.createDailyQuiz(today, qs.map((q) => q.id));
      quiz = await quizRepository.findTodayQuiz(today);
    }

    if (!quiz) throw new AppError('Could not load daily quiz', 500);

    const submitted = await quizRepository.findSubmission(userId, quiz.id);

    return {
      quizId: quiz.id,
      quizDate: quiz.quizDate,
      alreadySubmitted: !!submitted,
      questions: quiz.questions.map(({ question }) => ({
        id: question.id,
        text: question.text,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        topic: question.topic,
      })),
    };
  },

  async submitDaily(
    userId: string,
    quizId: string,
    answers: { questionId: string; answer: string; timeTaken: number }[],
  ) {
    const quiz = await quizRepository.findTodayQuiz(new Date().toISOString().split('T')[0]!);
    if (!quiz || quiz.id !== quizId) throw new AppError('Invalid quiz', 400);

    const existing = await quizRepository.findSubmission(userId, quizId);
    if (existing) throw new AppError('Already submitted today', 409);

    const questionMap = new Map(quiz.questions.map(({ question }) => [question.id, question]));

    let correct = 0;
    let wrong = 0;
    let totalTime = 0;

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;
      totalTime += ans.timeTaken;
      if (ans.answer === q.correctOption) correct++;
      else wrong++;
    }

    const avgTime = answers.length > 0 ? totalTime / answers.length : 0;
    const isPerfect = wrong === 0 && correct === DAILY_Q_COUNT;

    let xpGained = XP_REWARDS.dailyBase + correct * XP_REWARDS.perCorrect;
    if (isPerfect) xpGained += XP_REWARDS.perfect;

    await quizRepository.createSubmission({ userId, quizId, correct, wrong, avgTime, xpGained });

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const newStreak = calcNewStreak(user.streak, user.lastActiveAt);
    const newXp = user.xp + xpGained;
    const newLevel = xpToLevel(newXp);

    await userRepository.update(userId, {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastActiveAt: new Date(),
    });

    return { correct, wrong, avgTime, xpGained, streak: newStreak };
  },

  async addQuestion(data: {
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    topic: string;
    difficulty: Difficulty;
  }) {
    return quizRepository.createQuestion(data);
  },
};
