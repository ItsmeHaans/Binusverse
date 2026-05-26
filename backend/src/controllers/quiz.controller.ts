import { Request, Response, NextFunction } from 'express';
import { quizService } from '../services/quiz.service';
import { Difficulty } from '@prisma/client';

export const quizController = {
  async getDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await quizService.getDaily(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async submitDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizId, answers } = req.body as {
        quizId: string;
        answers: { questionId: string; answer: string; timeTaken: number }[];
      };
      const data = await quizService.submitDaily(req.user!.userId, quizId, answers);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async addQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await quizService.addQuestion({
        ...req.body,
        difficulty: req.body.difficulty as Difficulty,
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },
};
