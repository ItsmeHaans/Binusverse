import { battleRepository } from '../repositories/battle.repository';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { XP_REWARDS, xpToLevel } from '../utils/xp';
import { ELO, eloToDivision } from '../utils/rank';
import { BattleMode, Difficulty } from '@prisma/client';

const RAID_CONFIG = {
  EASY:   { count: 8,  passMark: 5 },
  NORMAL: { count: 10, passMark: 7 },
  HARD:   { count: 12, passMark: 9 },
};

export const battleService = {
  async getRaidQuestions(difficulty: Difficulty) {
    const config = RAID_CONFIG[difficulty];
    const questions = await battleRepository.getQuestionsByDifficulty(difficulty, config.count);
    if (questions.length < config.count) {
      throw new AppError(`Not enough ${difficulty} questions in bank`, 503);
    }
    return questions.map((q) => ({
      id: q.id,
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      topic: q.topic,
    }));
  },

  async submitRaid(
    userId: string,
    difficulty: Difficulty,
    answers: { questionId: string; answer: string; timeTaken: number }[],
    totalTimeMs: number,
  ) {
    const config = RAID_CONFIG[difficulty];
    const questions = await battleRepository.getQuestionsByDifficulty(difficulty, config.count);
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let correct = 0;
    let wrong = 0;

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;
      if (ans.answer === q.correctOption) correct++;
      else wrong++;
    }

    const cleared = correct >= config.passMark;
    const isPerfect = wrong === 0;

    const raidXp = {
      EASY: XP_REWARDS.raidEasy,
      NORMAL: XP_REWARDS.raidNormal,
      HARD: XP_REWARDS.raidHard,
    }[difficulty];

    let xpGained = cleared ? raidXp : Math.floor(raidXp * 0.3);
    if (isPerfect && cleared) xpGained += XP_REWARDS.perfect;

    await battleRepository.createBattleResult({
      userId,
      mode: BattleMode.RAID,
      difficulty,
      correct,
      wrong,
      timeElapsed: totalTimeMs / 1000,
      xpGained,
    });

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const newXp = user.xp + xpGained;
    await userRepository.update(userId, {
      xp: newXp,
      level: xpToLevel(newXp),
    });

    return {
      correct,
      wrong,
      cleared,
      passMark: config.passMark,
      xpGained,
    };
  },

  async createPvpSession(challengerId: string, opponentId: string) {
    if (challengerId === opponentId) throw new AppError('Cannot challenge yourself', 400);
    const session = await battleRepository.createPvpSession(challengerId, opponentId);
    return session;
  },

  async getPvpQuestions(sessionId: string, userId: string) {
    const session = await battleRepository.findPvpSession(sessionId);
    if (!session) throw new AppError('Session not found', 404);
    if (session.challengerId !== userId && session.opponentId !== userId) {
      throw new AppError('Not a participant', 403);
    }

    const questions = await battleRepository.getQuestionsByDifficulty(Difficulty.NORMAL, 10);
    return questions.map((q) => ({
      id: q.id,
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
    }));
  },

  async submitPvpAnswer(
    sessionId: string,
    userId: string,
    questionId: string,
    answer: string,
    timeTaken: number,
  ) {
    const session = await battleRepository.findPvpSession(sessionId);
    if (!session) throw new AppError('Session not found', 404);
    if (session.status === 'FINISHED') throw new AppError('Session already finished', 400);

    const question = await (await import('../prisma')).default.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new AppError('Question not found', 404);

    const correct = answer === question.correctOption;
    await battleRepository.createPvpAnswer({ sessionId, userId, questionId, answer, timeTaken, correct });

    return { correct };
  },

  async getPvpResult(sessionId: string, userId: string) {
    const session = await battleRepository.findPvpSession(sessionId);
    if (!session) throw new AppError('Session not found', 404);
    if (session.challengerId !== userId && session.opponentId !== userId) {
      throw new AppError('Not a participant', 403);
    }

    if (session.status !== 'FINISHED') {
      return { status: session.status };
    }

    const challengerAnswers = await battleRepository.getPvpAnswersByUser(sessionId, session.challengerId);
    const opponentAnswers = await battleRepository.getPvpAnswersByUser(sessionId, session.opponentId);

    return {
      status: session.status,
      winnerId: session.winnerId,
      challenger: {
        userId: session.challengerId,
        correct: challengerAnswers.filter((a) => a.correct).length,
        wrong: challengerAnswers.filter((a) => !a.correct).length,
      },
      opponent: {
        userId: session.opponentId,
        correct: opponentAnswers.filter((a) => a.correct).length,
        wrong: opponentAnswers.filter((a) => !a.correct).length,
      },
    };
  },

  async finalizePvpSession(sessionId: string) {
    const session = await battleRepository.findPvpSession(sessionId);
    if (!session || session.status === 'FINISHED') return;

    const challengerAnswers = await battleRepository.getPvpAnswersByUser(sessionId, session.challengerId);
    const opponentAnswers = await battleRepository.getPvpAnswersByUser(sessionId, session.opponentId);

    const cCorrect = challengerAnswers.filter((a) => a.correct).length;
    const oCorrect = opponentAnswers.filter((a) => a.correct).length;
    const cTime = challengerAnswers.reduce((s, a) => s + a.timeTaken, 0);
    const oTime = opponentAnswers.reduce((s, a) => s + a.timeTaken, 0);

    let winnerId: string | null = null;
    if (cCorrect > oCorrect) winnerId = session.challengerId;
    else if (oCorrect > cCorrect) winnerId = session.opponentId;
    else if (cTime < oTime) winnerId = session.challengerId;
    else if (oTime < cTime) winnerId = session.opponentId;

    await battleRepository.updatePvpSession(sessionId, {
      status: 'FINISHED',
      winnerId,
      endedAt: new Date(),
    });

    const challenger = await userRepository.findById(session.challengerId);
    const opponent = await userRepository.findById(session.opponentId);
    if (!challenger || !opponent) return;

    const cWon = winnerId === session.challengerId;
    const oWon = winnerId === session.opponentId;

    const cEloChange = cWon ? ELO.win : ELO.loss;
    const oEloChange = oWon ? ELO.win : ELO.loss;
    const cXp = cWon ? XP_REWARDS.pvpWin : XP_REWARDS.pvpLoss;
    const oXp = oWon ? XP_REWARDS.pvpWin : XP_REWARDS.pvpLoss;

    const cNewElo = Math.max(0, challenger.eloPoints + cEloChange);
    const oNewElo = Math.max(0, opponent.eloPoints + oEloChange);

    await Promise.all([
      userRepository.update(session.challengerId, {
        xp: challenger.xp + cXp,
        level: xpToLevel(challenger.xp + cXp),
        eloPoints: cNewElo,
        division: eloToDivision(cNewElo),
      }),
      userRepository.update(session.opponentId, {
        xp: opponent.xp + oXp,
        level: xpToLevel(opponent.xp + oXp),
        eloPoints: oNewElo,
        division: eloToDivision(oNewElo),
      }),
      battleRepository.createBattleResult({
        userId: session.challengerId,
        mode: BattleMode.PVP,
        correct: cCorrect,
        wrong: challengerAnswers.filter((a) => !a.correct).length,
        timeElapsed: cTime,
        xpGained: cXp,
        eloChange: cEloChange,
        opponentId: session.opponentId,
      }),
      battleRepository.createBattleResult({
        userId: session.opponentId,
        mode: BattleMode.PVP,
        correct: oCorrect,
        wrong: opponentAnswers.filter((a) => !a.correct).length,
        timeElapsed: oTime,
        xpGained: oXp,
        eloChange: oEloChange,
        opponentId: session.challengerId,
      }),
    ]);
  },

  getUserHistory(userId: string) {
    return battleRepository.getUserHistory(userId);
  },
};
