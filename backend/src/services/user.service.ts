import prisma from '../prismaClient';
import { AppError } from '../utils/AppError';

const PROFILE_SELECT = {
  id: true, name: true, email: true, faculty: true, batch: true,
  avatar: true, bio: true, level: true, xp: true, streak: true,
  gpa: true, attendance: true, division: true, rank: true,
  eloPoints: true, role: true, createdAt: true,
};

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PROFILE_SELECT });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function updateBio(userId: string, bio: string) {
  return prisma.user.update({ where: { id: userId }, data: { bio }, select: { id: true, bio: true } });
}

export async function updateProfile(userId: string, data: { name?: string; avatar?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, avatar: true },
  });
}

export async function getAcademicStatus(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, select: { gpa: true, attendance: true } });
}

export async function updateAcademicStatus(userId: string, data: { gpa?: number; attendance?: number }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, gpa: true, attendance: true },
  });
}

export async function getGpaHistory(userId: string) {
  return prisma.gpaHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, semester: true, ipValue: true, classesPassed: true, totalClasses: true },
  });
}

export async function addGpaHistory(
  userId: string,
  data: { semester: string; ipValue: number; classesPassed: number; totalClasses: number }
) {
  const record = await prisma.gpaHistory.create({ data: { userId, ...data } });
  await prisma.user.update({ where: { id: userId }, data: { gpa: data.ipValue } });
  return record;
}

export async function getClasses(userId: string, semester?: string) {
  return prisma.class.findMany({
    where: { userId, ...(semester && semester !== 'current' ? { semester } : {}) },
    select: { id: true, className: true, classCode: true, semester: true, passed: true },
  });
}

export async function addClass(
  userId: string,
  data: { className: string; classCode?: string; semester: string; passed?: boolean }
) {
  return prisma.class.create({ data: { userId, ...data } });
}

export async function getMissions(userId: string, status?: string) {
  return prisma.mission.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createMission(
  userId: string,
  data: { title: string; description?: string; dueDate?: string; imageUrl?: string }
) {
  return prisma.mission.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      imageUrl: data.imageUrl,
      source: 'manual',
    },
  });
}

export async function updateMission(
  userId: string,
  missionId: string,
  data: { status?: string; title?: string; description?: string }
) {
  const mission = await prisma.mission.findFirst({ where: { id: missionId, userId } });
  if (!mission) throw new AppError('Mission not found', 404);
  return prisma.mission.update({ where: { id: missionId }, data });
}

export async function searchUsers(query: string, excludeId: string) {
  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
      NOT: { id: excludeId },
    },
    take: 10,
    select: { id: true, name: true, email: true, level: true, rank: true, division: true, avatar: true },
  });
}
