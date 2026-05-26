import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  search(query: string) {
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, email: true, avatar: true, level: true, division: true },
      take: 20,
    });
  },

  getClasses(userId: string, semester?: string) {
    return prisma.class.findMany({
      where: { userId, ...(semester && { semester }) },
    });
  },

  addClass(data: Prisma.ClassCreateInput) {
    return prisma.class.create({ data });
  },

  getGpaHistory(userId: string) {
    return prisma.gpaHistory.findMany({ where: { userId }, orderBy: { semester: 'asc' } });
  },

  addGpaHistory(data: Prisma.GpaHistoryCreateInput) {
    return prisma.gpaHistory.create({ data });
  },

  getMissions(userId: string, status?: string) {
    return prisma.mission.findMany({
      where: { userId, ...(status && { status: status as 'ONGOING' | 'DONE' }) },
      orderBy: { createdAt: 'desc' },
    });
  },

  createMission(data: Prisma.MissionCreateInput) {
    return prisma.mission.create({ data });
  },

  updateMission(id: string, userId: string, data: Prisma.MissionUpdateInput) {
    return prisma.mission.updateMany({ where: { id, userId }, data });
  },

  saveRefreshToken(token: string, userId: string, expiresAt: Date) {
    return prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  },

  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
  },

  deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({ where: { token } });
  },

  deleteAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  },
};
