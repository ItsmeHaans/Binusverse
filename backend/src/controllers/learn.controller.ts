import { Request, Response } from 'express';
import { z } from 'zod';
import * as learnService from '../services/learn.service';
import { handleError } from '../utils/handleError';

export async function analyzePerformance(req: Request, res: Response): Promise<void> {
  try {
    const data = await learnService.analyzePerformance(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function suggestVideos(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    weaknessTopics: z.array(z.string()).min(1).max(5),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await learnService.suggestVideos(req.user!.id, parsed.data.weaknessTopics);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function getSkillUpgrades(req: Request, res: Response): Promise<void> {
  const { random } = req.query as { random?: string };
  const randomCount = random ? parseInt(random, 10) : undefined;
  try {
    const data = await learnService.getSkillUpgrades(req.user!.id, randomCount);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}
