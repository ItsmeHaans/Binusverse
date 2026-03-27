import prisma from '../prismaClient';
import { AppError } from '../utils/AppError';
import { getLevelFromXp, XP_REWARDS } from '../utils/xp';
import { calculateNewStreak, todayDateString } from '../utils/streak';
import { generateAndSaveDailyQuiz } from './cron';

export async function getDailyQuiz(userId: string) {
  const today = todayDateString();

  const questions = await prisma.dailyQuiz.findMany({
    where: { quizDate: today },
    select: {
      id: true, question: true, optionA: true, optionB: true,
      optionC: true, optionD: true, topic: true, difficulty: true,
    },
  });

  const submission = await prisma.dailyQuizSubmission.findUnique({
    where: { userId_quizDate: { userId, quizDate: today } },
  });

  return { questions, alreadySubmitted: !!submission, submission: submission ?? null };
}

export async function submitDailyQuiz(
  userId: string,
  answers: { questionId: string; answer: string; timeTaken: number }[]
) {
  const today = todayDateString();

  const existing = await prisma.dailyQuizSubmission.findUnique({
    where: { userId_quizDate: { userId, quizDate: today } },
  });
  if (existing) throw new AppError('Daily quiz already submitted today', 409);

  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.dailyQuiz.findMany({
    where: { id: { in: questionIds }, quizDate: today },
  });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let correct = 0;
  let wrong = 0;
  let totalTime = 0;

  for (const ans of answers) {
    const q = questionMap.get(ans.questionId);
    if (!q) continue;
    if (q.correctOption === ans.answer) correct++;
    else wrong++;
    totalTime += ans.timeTaken;
  }

  const answered = correct + wrong;
  const avgTime = answered > 0 ? totalTime / answered : 0;
  const xpGained = XP_REWARDS.DAILY_QUIZ;

  await prisma.dailyQuizSubmission.create({
    data: { userId, quizDate: today, correct, wrong, avgTime, xpGained },
  });

  await prisma.battleResult.create({
    data: { userId, mode: 'DAILY', correct, wrong, timeElapsed: Math.round(totalTime), xpGained },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const newXp = user.xp + xpGained;
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: getLevelFromXp(newXp),
        streak: calculateNewStreak(user.streak, user.lastActiveAt),
        lastActiveAt: new Date(),
      },
    });
  }

  return { correct, wrong, avgTime: Math.round(avgTime * 100) / 100, xpGained };
}

export async function generateQuiz() {
  await generateAndSaveDailyQuiz();
  const today = todayDateString();
  const count = await prisma.dailyQuiz.count({ where: { quizDate: today } });
  return { count, date: today };
}
