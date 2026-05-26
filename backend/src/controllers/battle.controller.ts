import { Request, Response, NextFunction } from 'express';
import { battleService } from '../services/battle.service';
import { Difficulty } from '@prisma/client';

export const battleController = {
  async getRaidQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const difficulty = ((req.query['difficulty'] as string) ?? 'NORMAL').toUpperCase() as Difficulty;
      const data = await battleService.getRaidQuestions(difficulty);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async submitRaid(req: Request, res: Response, next: NextFunction) {
    try {
      const { difficulty, answers, totalTimeMs } = req.body as {
        difficulty: Difficulty;
        answers: { questionId: string; answer: string; timeTaken: number }[];
        totalTimeMs: number;
      };
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
