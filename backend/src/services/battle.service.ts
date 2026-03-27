import prisma from '../prismaClient';
import { AppError } from '../utils/AppError';
import { getDivisionFromElo, updateElo } from '../utils/division';
import { getLevelFromXp, XP_REWARDS } from '../utils/xp';
import { calculateNewStreak, todayDateString } from '../utils/streak';
import { generateRaidQuestions } from './gemini';

// ─── PvP ─────────────────────────────────────────────────────────────────────

export async function createPvpChallenge(challengerId: string, opponentId: string) {
  if (challengerId === opponentId) throw new AppError('Cannot challenge yourself', 400);

  const opponent = await prisma.user.findUnique({ where: { id: opponentId } });
  if (!opponent) throw new AppError('Opponent not found', 404);

  const existing = await prisma.pvpSession.findFirst({
    where: {
      OR: [
        { challengerId, opponentId },
        { challengerId: opponentId, opponentId: challengerId },
      ],
      status: { in: ['WAITING', 'ACTIVE'] },
    },
  });

  if (existing) throw new AppError(`Active session already exists: ${existing.id}`, 409);

  return prisma.pvpSession.create({
    data: { challengerId, opponentId },
    include: {
      challenger: { select: { id: true, name: true, level: true, division: true } },
      opponent: { select: { id: true, name: true, level: true, division: true } },
    },
  });
}

export async function getPvpQuestions(sessionId: string, userId: string) {
  const session = await prisma.pvpSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new AppError('Session not found', 404);
  if (session.challengerId !== userId && session.opponentId !== userId) {
    throw new AppError('You are not part of this session', 403);
  }

  const today = todayDateString();
  return prisma.dailyQuiz.findMany({
    where: { quizDate: today },
    take: 10,
    select: { id: true, question: true, optionA: true, optionB: true, optionC: true, optionD: true, topic: true },
  });
}

export async function submitPvpAnswer(
  sessionId: string,
  userId: string,
  questionId: string,
  answer: string,
  timeTaken: number
) {
  const session = await prisma.pvpSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new AppError('Session not found', 404);
  if (session.challengerId !== userId && session.opponentId !== userId) {
    throw new AppError('You are not part of this session', 403);
  }
  if (session.status !== 'ACTIVE') {
    throw new AppError(`Session is ${session.status.toLowerCase()}`, 400);
  }

  const question = await prisma.dailyQuiz.findUnique({ where: { id: questionId } });
  if (!question) throw new AppError('Question not found', 404);

  const alreadyAnswered = await prisma.pvpAnswer.findFirst({
    where: { sessionId, userId, questionId },
  });
  if (alreadyAnswered) throw new AppError('Already answered this question', 409);

  const correct = question.correctOption === answer;
  await prisma.pvpAnswer.create({
    data: { sessionId, userId, questionId, answer, timeTaken, correct },
  });

  // Check if battle is complete
  const today = todayDateString();
  const totalQ = Math.min(await prisma.dailyQuiz.count({ where: { quizDate: today } }), 10);
  const challengerCount = await prisma.pvpAnswer.count({ where: { sessionId, userId: session.challengerId } });
  const opponentCount = await prisma.pvpAnswer.count({ where: { sessionId, userId: session.opponentId } });

  let result = null;
  if (challengerCount >= totalQ && opponentCount >= totalQ) {
    result = await finalizePvpSession(sessionId);
  }

  return { correct, answer, result };
}

export async function getPvpResult(sessionId: string) {
  const session = await prisma.pvpSession.findUnique({
    where: { id: sessionId },
    include: {
      challenger: { select: { id: true, name: true, level: true, division: true } },
      opponent: { select: { id: true, name: true, level: true, division: true } },
      answers: true,
    },
  });
  if (!session) throw new AppError('Session not found', 404);

  const calcScore = (uid: string) => {
    const ans = session.answers.filter((a) => a.userId === uid);
    return {
      correct: ans.filter((a) => a.correct).length,
      wrong: ans.filter((a) => !a.correct).length,
      avgTime: ans.length ? ans.reduce((s, a) => s + a.timeTaken, 0) / ans.length : 0,
    };
  };

  return {
    sessionId,
    status: session.status,
    winnerId: session.winnerId,
    challenger: { ...session.challenger, ...calcScore(session.challengerId) },
    opponent: { ...session.opponent, ...calcScore(session.opponentId) },
  };
}

// Exported so websocket/pvp.ts can call it after all answers are in
export async function finalizePvpSession(sessionId: string) {
  const session = await prisma.pvpSession.findUnique({
    where: { id: sessionId },
    include: { answers: true, challenger: true, opponent: true },
  });

  if (!session || session.status === 'FINISHED') return null;

  const calcScore = (uid: string) => {
    const ans = session.answers.filter((a) => a.userId === uid);
    const correct = ans.filter((a) => a.correct).length;
    const avgTime = ans.length ? ans.reduce((s, a) => s + a.timeTaken, 0) / ans.length : 999;
    return { correct, avgTime, totalTime: ans.reduce((s, a) => s + a.timeTaken, 0) };
  };

  const cs = calcScore(session.challengerId);
  const os = calcScore(session.opponentId);

  let winnerId: string;
  if (cs.correct > os.correct) winnerId = session.challengerId;
  else if (os.correct > cs.correct) winnerId = session.opponentId;
  else winnerId = cs.avgTime <= os.avgTime ? session.challengerId : session.opponentId;

  await prisma.pvpSession.update({
    where: { id: sessionId },
    data: { status: 'FINISHED', winnerId, endedAt: new Date() },
  });

  await _updatePlayerStatsAfterPvp(session.challengerId, winnerId === session.challengerId, cs.correct, cs.totalTime, session.opponentId, session.answers);
  await _updatePlayerStatsAfterPvp(session.opponentId, winnerId === session.opponentId, os.correct, os.totalTime, session.challengerId, session.answers);

  return {
    winnerId,
    challenger: { id: session.challengerId, name: session.challenger.name, ...cs },
    opponent: { id: session.opponentId, name: session.opponent.name, ...os },
  };
}

async function _updatePlayerStatsAfterPvp(
  userId: string,
  won: boolean,
  correct: number,
  totalTime: number,
  opponentId: string,
  allAnswers: { userId: string; correct: boolean }[]
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const xpGain = won ? XP_REWARDS.PVP_WIN : XP_REWARDS.PVP_LOSS;
  const newXp = user.xp + xpGain;
  const newElo = updateElo(user.eloPoints, won);

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: getLevelFromXp(newXp),
      eloPoints: newElo,
      division: getDivisionFromElo(newElo),
      streak: calculateNewStreak(user.streak, user.lastActiveAt),
      lastActiveAt: new Date(),
    },
  });

  const wrong = allAnswers.filter((a) => a.userId === userId && !a.correct).length;
  await prisma.battleResult.create({
    data: {
      userId,
      mode: 'PVP',
      correct,
      wrong,
      timeElapsed: Math.round(totalTime),
      opponentId,
      xpGained: xpGain,
    },
  });
}

// ─── Raid ─────────────────────────────────────────────────────────────────────

export async function getRaidQuestions(difficulty: 'easy' | 'normal' | 'hard') {
  let questions = await prisma.dailyQuiz.findMany({
    where: { difficulty },
    take: 10,
    select: { id: true, question: true, optionA: true, optionB: true, optionC: true, optionD: true, topic: true, difficulty: true },
  });

  if (questions.length < 5) {
    const generated = await generateRaidQuestions(difficulty, 10);
    const today = todayDateString();
    await prisma.dailyQuiz.createMany({
      data: generated.map((q) => ({
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        topic: q.topic,
        difficulty,
        quizDate: today,
        aiGenerated: true,
      })),
    });

    questions = await prisma.dailyQuiz.findMany({
      where: { difficulty },
      take: 10,
      select: { id: true, question: true, optionA: true, optionB: true, optionC: true, optionD: true, topic: true, difficulty: true },
    });
  }

  return questions;
}

export async function submitRaid(
  userId: string,
  difficulty: 'easy' | 'normal' | 'hard',
  answers: { questionId: string; answer: string; timeTaken: number }[]
) {
  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.dailyQuiz.findMany({ where: { id: { in: questionIds } } });
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

  const xpMap = { easy: XP_REWARDS.RAID_EASY, normal: XP_REWARDS.RAID_NORMAL, hard: XP_REWARDS.RAID_HARD };
  const xpGained = xpMap[difficulty];

  await prisma.battleResult.create({
    data: { userId, mode: 'RAID', correct, wrong, timeElapsed: Math.round(totalTime), difficulty, xpGained },
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

  return { correct, wrong, totalTime: Math.round(totalTime), xpGained };
}
