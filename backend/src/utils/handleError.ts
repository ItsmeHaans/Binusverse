import { Response } from 'express';
import { AppError } from './AppError';

export function handleError(err: unknown, res: Response): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
  } else {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
