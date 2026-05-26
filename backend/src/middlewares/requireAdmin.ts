import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    return next(new AppError('Admin access required', 403));
  }
  next();
}
