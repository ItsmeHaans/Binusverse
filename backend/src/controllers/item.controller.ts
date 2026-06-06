import { Request, Response, NextFunction } from 'express';
import { itemService } from '../services/item.service';

export const itemController = {
  async getInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await itemService.getInventory(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async useItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemName } = req.body as { itemName: string };
      const data = await itemService.useItem(req.user!.userId, itemName);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
