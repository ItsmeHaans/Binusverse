import { Request, Response } from 'express';
import { z } from 'zod';
import * as userService from '../services/user.service';
import { handleError } from '../utils/handleError';

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const data = await userService.getProfile(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function updateBio(req: Request, res: Response): Promise<void> {
  const { bio } = req.body as { bio?: string };
  if (typeof bio !== 'string') {
    res.status(400).json({ success: false, message: 'bio must be a string' });
    return;
  }
  try {
    const data = await userService.updateBio(req.user!.id, bio);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    name: z.string().min(2).optional(),
    avatar: z.string().url().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await userService.updateProfile(req.user!.id, parsed.data);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function getAcademicStatus(req: Request, res: Response): Promise<void> {
  try {
    const data = await userService.getAcademicStatus(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function updateAcademicStatus(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    gpa: z.number().min(0).max(4).optional(),
    attendance: z.number().min(0).max(100).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await userService.updateAcademicStatus(req.user!.id, parsed.data);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function getGpaHistory(req: Request, res: Response): Promise<void> {
  try {
    const data = await userService.getGpaHistory(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function addGpaHistory(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    semester: z.string().min(1),
    ipValue: z.number().min(0).max(4),
    classesPassed: z.number().int().min(0),
    totalClasses: z.number().int().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await userService.addGpaHistory(req.user!.id, parsed.data);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function getClasses(req: Request, res: Response): Promise<void> {
  const { semester } = req.query as { semester?: string };
  try {
    const data = await userService.getClasses(req.user!.id, semester);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function addClass(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    className: z.string().min(1),
    classCode: z.string().optional(),
    semester: z.string().min(1),
    passed: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await userService.addClass(req.user!.id, parsed.data);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function getMissions(req: Request, res: Response): Promise<void> {
  const { status } = req.query as { status?: string };
  try {
    const data = await userService.getMissions(req.user!.id, status);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function createMission(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    imageUrl: z.string().url().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await userService.createMission(req.user!.id, parsed.data);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function updateMission(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const schema = z.object({
    status: z.enum(['ongoing', 'completed']).optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await userService.updateMission(req.user!.id, id, parsed.data);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function searchUsers(req: Request, res: Response): Promise<void> {
  const { q } = req.query as { q?: string };
  if (!q || q.trim().length < 2) {
    res.status(400).json({ success: false, message: 'Query must be at least 2 characters' });
    return;
  }
  try {
    const data = await userService.searchUsers(q.trim(), req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}
