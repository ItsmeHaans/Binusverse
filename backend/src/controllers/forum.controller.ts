import { Request, Response } from 'express';
import { z } from 'zod';
import * as forumService from '../services/forum.service';
import { handleError } from '../utils/handleError';

export async function getForumList(req: Request, res: Response): Promise<void> {
  try {
    const faculty = await forumService.getUserFaculty(req.user!.id);
    const data = forumService.getForumList(faculty ?? undefined);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function getPosts(req: Request, res: Response): Promise<void> {
  const { forum_type, page = '1', limit = '20' } = req.query as {
    forum_type?: string; page?: string; limit?: string;
  };
  if (!forum_type) {
    res.status(400).json({ success: false, message: 'forum_type is required' });
    return;
  }
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  try {
    const { posts, total, totalPages } = await forumService.getPosts(req.user!.id, forum_type, pageNum, limitNum);
    res.json({ success: true, data: posts, meta: { total, page: pageNum, limit: limitNum, totalPages } });
  } catch (err) { handleError(err, res); }
}

export async function createPost(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    forumType: z.string().min(1),
    content: z.string().min(1).max(2000),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await forumService.createPost(req.user!.id, parsed.data.forumType, parsed.data.content);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function togglePostLike(req: Request, res: Response): Promise<void> {
  try {
    const data = await forumService.togglePostLike(req.params.id, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function getComments(req: Request, res: Response): Promise<void> {
  try {
    const data = await forumService.getComments(req.params.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function createComment(req: Request, res: Response): Promise<void> {
  const schema = z.object({ content: z.string().min(1).max(1000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const data = await forumService.createComment(req.params.id, req.user!.id, parsed.data.content);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(err, res); }
}

export async function toggleCommentLike(req: Request, res: Response): Promise<void> {
  try {
    const data = await forumService.toggleCommentLike(req.params.id, req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(err, res); }
}
