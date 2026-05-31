import { Request, Response, NextFunction } from 'express';
import { leaderboardService } from '../services/leaderboard.service';

export const leaderboardController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const mode = (req.query['mode'] as string) ?? 'pvp';
      const rawLimit = parseInt((req.query['limit'] as string) ?? '50', 10);
      const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 50 : rawLimit), 100);

      const data = mode === 'daily'
        ? await leaderboardService.getDailyLeaderboard(limit)
        : await leaderboardService.getPvpLeaderboard(limit);

      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
