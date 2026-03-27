import { Request, Response } from 'express';
import { z } from 'zod';
import * as battleService from '../services/battle.service';
import { handleError } from '../utils/handleError';

export async function createPvpChallenge(req: Request, res: Response): Promise<void> {
  const schema = z.object({ opponentId: z.string().uuid() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await battleService.createPvpChallenge(req.user!.id, parsed.data.opponentId);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function getPvpQuestions(req: Request, res: Response): Promise<void> {
  try {
    const data = await battleService.getPvpQuestions(req.params.id, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function submitPvpAnswer(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    questionId: z.string().uuid(),
    answer: z.enum(['A', 'B', 'C', 'D']),
    timeTaken: z.number().positive(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await battleService.submitPvpAnswer(
      req.params.id, req.user!.id,
      parsed.data.questionId, parsed.data.answer, parsed.data.timeTaken
    );
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function getPvpResult(req: Request, res: Response): Promise<void> {
  try {
    const data = await battleService.getPvpResult(req.params.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function getRaidQuestions(req: Request, res: Response): Promise<void> {
  const { difficulty } = req.query as { difficulty?: string };
  if (!difficulty || !['easy', 'normal', 'hard'].includes(difficulty)) {
    res.status(400).json({ success: false, message: 'difficulty must be easy, normal, or hard' });
    return;
  }
  try {
    const data = await battleService.getRaidQuestions(difficulty as 'easy' | 'normal' | 'hard');
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function submitRaid(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    difficulty: z.enum(['easy', 'normal', 'hard']),
    answers: z.array(z.object({
      questionId: z.string().uuid(),
      answer: z.enum(['A', 'B', 'C', 'D']),
      timeTaken: z.number().positive(),
    })),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await battleService.submitRaid(req.user!.id, parsed.data.difficulty, parsed.data.answers);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}
