import { quizRepository } from '../repositories/quiz.repository';
import { userRepository } from '../repositories/user.repository';
import { itemRepository } from '../repositories/item.repository';
import { AppError } from '../utils/AppError';
import { XP_REWARDS, xpToLevel } from '../utils/xp';
import { calcNewStreak } from '../utils/streak';
import { eloToDivision } from '../utils/rank';
import { Difficulty } from '@prisma/client';

const DAILY_Q_COUNT = 10;

function pickRandomItem(items: { id: string; name: string }[], accuracy: number): { id: string; name: string } | null {
  let chance = 0;
  if (accuracy >= 1.0)  chance = 0.70;
  else if (accuracy >= 0.85) chance = 0.45;
  else if (accuracy >= 0.70) chance = 0.25;
  else if (accuracy >= 0.50) chance = 0.10;
  if (items.length === 0 || Math.random() >= chance) return null;
  return items[Math.floor(Math.random() * items.length)]!;
}

export const quizService = {
  async getDaily(userId: string) {
    const today = new Date().toISOString().split('T')[0]!;
    let quiz = await quizRepository.findTodayQuiz(today);

    if (!quiz) {
      const qs = await quizRepository.getQuestionsByDifficulty(Difficulty.NORMAL, DAILY_Q_COUNT);
      if (qs.length < DAILY_Q_COUNT) throw new AppError('Not enough questions in bank', 503);
      try {
        await quizRepository.createDailyQuiz(today, qs.map((q) => q.id));
      } catch {
        // Concurrent request already created it
      }
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
        correctOption: question.correctOption,
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
      division: eloToDivision(user.eloPoints),
      lastActiveAt: new Date(),
    });

    // Award random item based on accuracy
    const accuracy = correct / DAILY_Q_COUNT;
    const allItems = await itemRepository.getAllItems();
    const earnedItemRecord = pickRandomItem(allItems, accuracy);
    let earnedItem: string | null = null;
    if (earnedItemRecord) {
      await itemRepository.giveItemToUser(userId, earnedItemRecord.id);
      earnedItem = earnedItemRecord.name;
    }

    return { correct, wrong, avgTime, xpGained, streak: newStreak, earnedItem };
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
