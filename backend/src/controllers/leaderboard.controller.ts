import { Request, Response } from 'express';
import * as leaderboardService from '../services/leaderboard.service';
import { handleError } from '../utils/handleError';

export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  const { mode = 'daily', limit = '50' } = req.query as { mode?: string; limit?: string };
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  try {
    const data = await leaderboardService.getLeaderboard(mode, limitNum);
    res.json({ success: true, data: data.entries, mode: data.mode });
  } catch (err) { handleError(err, res); }
}
