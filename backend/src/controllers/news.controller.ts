import { Request, Response, NextFunction } from 'express';
import { newsService } from '../services/news.service';

export const newsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const rawPage = parseInt((req.query['page'] as string) ?? '1', 10);
      const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
      const data = await newsService.getAll(page);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await newsService.getById(req.params['id']!);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await newsService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await newsService.update(req.params['id']!, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await newsService.delete(req.params['id']!);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  },
};
