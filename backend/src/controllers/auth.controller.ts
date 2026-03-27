import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { handleError } from '../utils/handleError';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().refine(
    (e) => e.endsWith('@binus.ac.id') || e.endsWith('@student.binus.ac.id'),
    { message: 'Email must be a BINUS email' }
  ),
  password: z.string().min(8),
  batch: z.string().min(1),
  faculty: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await authService.register(
      parsed.data.name, parsed.data.email, parsed.data.password,
      parsed.data.batch, parsed.data.faculty
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await authService.login(parsed.data.email, parsed.data.password);
    res.json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'Refresh token required' });
    return;
  }
  try {
    const data = await authService.refresh(refreshToken);
    res.json({ success: true, data });
  } catch (err) {
    handleError(err, res);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };
  try {
    await authService.logout(refreshToken);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    handleError(err, res);
  }
}

