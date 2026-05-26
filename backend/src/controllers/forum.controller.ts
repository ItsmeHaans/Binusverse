import { Request, Response, NextFunction } from 'express';
import { forumService } from '../services/forum.service';

export const forumController = {
  getChannels(_req: Request, res: Response) {
    res.json({ success: true, data: forumService.getChannels() });
  },

  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = (req.query['channel'] as string) ?? 'global';
      const page = parseInt((req.query['page'] as string) ?? '1', 10);
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

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await forumService.getComments(req.params['id']!);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await forumService.createComment(
        req.params['id']!,
        req.user!.userId,
        req.body.content,
      );
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async toggleCommentLike(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await forumService.toggleCommentLike(req.params['id']!, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
