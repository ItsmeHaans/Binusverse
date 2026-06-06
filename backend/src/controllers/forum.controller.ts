import { Request, Response, NextFunction } from 'express';
import { forumService } from '../services/forum.service';

export const forumController = {
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = (req.query['channel'] as string) ?? 'global';
      const rawPage = parseInt((req.query['page'] as string) ?? '1', 10);
      const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
      const data = await forumService.getPosts(channel, page);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { channel, content } = req.body as { channel: string; content: string };
      const data = await forumService.createPost(req.user!.userId, channel, content);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async togglePostLike(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await forumService.togglePostLike(req.params['id']!, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
