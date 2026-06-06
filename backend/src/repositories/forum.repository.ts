import prisma from '../prisma';

export const forumRepository = {
  getPosts(channel: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return prisma.forumPost.findMany({
      where: { channel, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, avatar: true, level: true } },
        _count: { select: { likes: true } },
      },
    });
  },

  createPost(userId: string, channel: string, content: string) {
    return prisma.forumPost.create({
      data: { userId, channel, content },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  },

  findPost(id: string) {
    return prisma.forumPost.findUnique({ where: { id } });
  },

  softDeletePost(id: string) {
    return prisma.forumPost.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  findPostLike(postId: string, userId: string) {
    return prisma.forumPostLike.findUnique({ where: { postId_userId: { postId, userId } } });
  },

  createPostLike(postId: string, userId: string) {
    return prisma.forumPostLike.create({ data: { postId, userId } });
  },

  deletePostLike(postId: string, userId: string) {
    return prisma.forumPostLike.delete({ where: { postId_userId: { postId, userId } } });
  },
};
