import prisma from '../prismaClient';
import { AppError } from '../utils/AppError';

export async function getNews(page: number, limit: number, order: string) {
  const skip = (page - 1) * limit;
  const [news, total] = await Promise.all([
    prisma.news.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: order === 'oldest' ? 'asc' : 'desc' },
    }),
    prisma.news.count(),
  ]);
  return { news, total, totalPages: Math.ceil(total / limit) };
}

export async function getNewsById(id: string) {
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) throw new AppError('News not found', 404);
  return news;
}

export async function createNews(
  adminId: string,
  data: { title: string; content: string; imageUrl?: string }
) {
  return prisma.news.create({ data: { ...data, createdBy: adminId } });
}

export async function updateNews(
  id: string,
  data: { title?: string; content?: string; imageUrl?: string | null }
) {
  const exists = await prisma.news.findUnique({ where: { id } });
  if (!exists) throw new AppError('News not found', 404);
  return prisma.news.update({ where: { id }, data });
}

export async function deleteNews(id: string) {
  const exists = await prisma.news.findUnique({ where: { id } });
  if (!exists) throw new AppError('News not found', 404);
  await prisma.news.delete({ where: { id } });
}
