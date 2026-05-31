import { Request, Response, NextFunction } from 'express';
import { battleService } from '../services/battle.service';
import { Difficulty } from '@prisma/client';
import { AppError } from '../utils/AppError';

const VALID_DIFFICULTIES = new Set<string>(['EASY', 'NORMAL', 'HARD']);

export const battleController = {
  async getRaidQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const raw = ((req.query['difficulty'] as string) ?? 'NORMAL').toUpperCase();
      if (!VALID_DIFFICULTIES.has(raw)) return next(new AppError('Invalid difficulty', 400));
      const difficulty = raw as Difficulty;
      const data = await battleService.getRaidQuestions(difficulty);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async submitRaid(req: Request, res: Response, next: NextFunction) {
    try {
      const { difficulty: rawDiff, answers, totalTimeMs } = req.body as {
        difficulty: string;
        answers: { questionId: string; answer: string; timeTaken: number }[];
        totalTimeMs: number;
      };
      const diffUpper = (rawDiff ?? '').toUpperCase();
      if (!VALID_DIFFICULTIES.has(diffUpper)) return next(new AppError('Invalid difficulty', 400));
      if (!Array.isArray(answers) || answers.length === 0) return next(new AppError('Answers required', 400));
      const difficulty = diffUpper as Difficulty;
      const data = await battleService.submitRaid(req.user!.userId, difficulty, answers, totalTimeMs);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async createPvpSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { opponentId } = req.body as { opponentId: string };
      const data = await battleService.createPvpSession(req.user!.userId, opponentId);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getPvpQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await battleService.getPvpQuestions(req.params['id']!, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async submitPvpAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId, answer, timeTaken } = req.body as {
        questionId: string;
        answer: string;
        timeTaken: number;
      };
      const data = await battleService.submitPvpAnswer(
        req.params['id']!,
        req.user!.userId,
        questionId,
        answer,
        timeTaken,
      );
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getPvpResult(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await battleService.getPvpResult(req.params['id']!, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await battleService.getUserHistory(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
