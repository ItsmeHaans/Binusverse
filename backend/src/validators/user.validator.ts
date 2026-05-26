import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
});

export const updateBioSchema = z.object({
  bio: z.string().max(500),
});

export const updateAcademicSchema = z.object({
  gpa: z.number().min(0).max(4).optional(),
  attendance: z.number().min(0).max(100).optional(),
});

export const addGpaHistorySchema = z.object({
  semester: z.string().min(1),
  ipValue: z.number().min(0).max(4),
  classesPassed: z.number().int().min(0),
  totalClasses: z.number().int().min(1),
});

export const addClassSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  semester: z.string().min(1),
  passed: z.boolean().optional(),
});

export const createMissionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
});

export const updateMissionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['ONGOING', 'DONE']).optional(),
  dueDate: z.string().datetime().optional(),
});
