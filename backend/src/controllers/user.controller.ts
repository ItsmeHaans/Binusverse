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

  async getAcademic(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.getAcademic(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async updateAcademic(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.updateAcademic(req.user!.userId, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getGpaHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.getGpaHistory(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async addGpaHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.addGpaHistory(req.user!.userId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const semester = req.query['semester'] as string | undefined;
      const data = await userService.getClasses(req.user!.userId, semester);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async addClass(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.addClass(req.user!.userId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getMissions(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query['status'] as string | undefined;
      const data = await userService.getMissions(req.user!.userId, status);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async createMission(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.createMission(req.user!.userId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async updateMission(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.updateMission(req.params['id']!, req.user!.userId, req.body);
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
