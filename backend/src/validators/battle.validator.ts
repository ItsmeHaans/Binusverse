import { z } from 'zod';

export const raidSubmitSchema = z.object({
  difficulty: z.enum(['EASY', 'NORMAL', 'HARD']),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.enum(['A', 'B', 'C', 'D']),
      timeTaken: z.number().min(0),
    }),
  ).min(1),
  totalTimeMs: z.number().min(0),
});

export const pvpChallengeSchema = z.object({
  opponentId: z.string().uuid(),
});

export const pvpAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.enum(['A', 'B', 'C', 'D']),
  timeTaken: z.number().min(0),
});
