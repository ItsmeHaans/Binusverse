import { z } from 'zod';

export const submitDailySchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.enum(['A', 'B', 'C', 'D']),
      timeTaken: z.number().min(0),
    }),
  ).min(1),
});

export const addQuestionSchema = z.object({
  text: z.string().min(5),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctOption: z.enum(['A', 'B', 'C', 'D']),
  topic: z.string().min(1),
  difficulty: z.enum(['EASY', 'NORMAL', 'HARD']).default('NORMAL'),
});
