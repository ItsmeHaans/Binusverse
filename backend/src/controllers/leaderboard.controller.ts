import { Request, Response, NextFunction } from 'express';
import { leaderboardService } from '../services/leaderboard.service';

export const leaderboardController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const mode = (req.query['mode'] as string) ?? 'pvp';
      const limit = parseInt((req.query['limit'] as string) ?? '50', 10);

      const data = mode === 'daily'
        ? await leaderboardService.getDailyLeaderboard(limit)
        : await leaderboardService.getPvpLeaderboard(limit);

      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
