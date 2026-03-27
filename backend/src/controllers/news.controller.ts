import { Request, Response } from 'express';
import { z } from 'zod';
import * as newsService from '../services/news.service';
import { handleError } from '../utils/handleError';

export async function getNews(req: Request, res: Response): Promise<void> {
  const { page = '1', limit = '10', order = 'latest' } = req.query as {
    page?: string; limit?: string; order?: string;
  };
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  try {
    const { news, total, totalPages } = await newsService.getNews(pageNum, limitNum, order);
    res.json({ success: true, data: news, meta: { total, page: pageNum, limit: limitNum, totalPages } });
  } catch (err) { handleError(err, res); }
}

export async function getNewsById(req: Request, res: Response): Promise<void> {
  try {
    const data = await newsService.getNewsById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function createNews(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    imageUrl: z.string().url().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await newsService.createNews(req.user!.id, parsed.data);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function updateNews(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().min(1).optional(),
    imageUrl: z.string().url().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await newsService.updateNews(req.params.id, parsed.data);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function deleteNews(req: Request, res: Response): Promise<void> {
  try {
    await newsService.deleteNews(req.params.id);
    res.json({ success: true, message: 'News deleted' });
  } catch (err) { handleError(err, res); }
}
