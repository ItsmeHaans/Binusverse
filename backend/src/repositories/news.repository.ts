import prisma from '../prisma';

export const newsRepository = {
  getAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return prisma.news.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true } } },
    });
  },

  findById(id: string) {
    return prisma.news.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });
  },

  create(data: { title: string; content: string; imageUrl?: string; authorId: string }) {
    return prisma.news.create({ data });
  },

  update(id: string, data: { title?: string; content?: string; imageUrl?: string }) {
    return prisma.news.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.news.delete({ where: { id } });
  },
};
