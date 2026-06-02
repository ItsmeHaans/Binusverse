import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export const userController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.getProfile(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.updateProfile(req.user!.userId, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async updateBio(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.updateBio(req.user!.userId, req.body.bio);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getState(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.getState(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async saveState(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.saveState(req.user!.userId, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query['q'] as string) ?? '';
      const data = await userService.searchUsers(q);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
