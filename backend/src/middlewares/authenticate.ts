import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { Role } from '@prisma/client';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    const role = payload.role as Role;
    if (!Object.values(Role).includes(role)) {
      return next(new AppError('Invalid token', 401));
    }
    req.user = { userId: payload.userId, role };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
