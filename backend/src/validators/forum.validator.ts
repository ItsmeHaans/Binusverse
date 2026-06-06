import { z } from 'zod';

export const createPostSchema = z.object({
  channel: z.string().min(1),
  content: z.string().min(1).max(2000),
});
