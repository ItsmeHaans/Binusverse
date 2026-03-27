import { Request, Response } from 'express';
import { z } from 'zod';
import * as quizService from '../services/quiz.service';
import { handleError } from '../utils/handleError';

export async function getDailyQuiz(req: Request, res: Response): Promise<void> {
  try {
    const data = await quizService.getDailyQuiz(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function submitDailyQuiz(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    answers: z.array(z.object({
      questionId: z.string().uuid(),
      answer: z.enum(['A', 'B', 'C', 'D']),
      timeTaken: z.number().positive(),
    })).min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await quizService.submitDailyQuiz(req.user!.id, parsed.data.answers);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function generateQuiz(req: Request, res: Response): Promise<void> {
  try {
    const { count, date } = await quizService.generateQuiz();
    res.json({ success: true, message: `Quiz generation complete. ${count} questions available for ${date}.` });
  } catch (err) { handleError(err, res); }
}
