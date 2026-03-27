import prisma from '../prismaClient';
import { AppError } from '../utils/AppError';

export function getForumList(faculty: string | undefined) {
  return [
    { id: 'global', name: 'BINUSVERSE Global', type: 'global', description: 'Open to all BINUS students' },
    {
      id: faculty?.toLowerCase().replace(/\s+/g, '-') ?? 'faculty',
      name: faculty ?? 'Faculty Forum',
      type: 'faculty',
      description: `Exclusive to ${faculty ?? 'your faculty'} students`,
    },
  ];
}

export async function getUserFaculty(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { faculty: true } });
  return user?.faculty;
}

function facultySlug(faculty: string | undefined) {
  return faculty?.toLowerCase().replace(/\s+/g, '-');
}

export async function getPosts(userId: string, forumType: string, page: number, limit: number) {
  if (forumType !== 'global') {
    const faculty = await getUserFaculty(userId);
    if (facultySlug(faculty) !== forumType) {
      throw new AppError('Access denied to this faculty forum', 403);
    }
  }

  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where: { forumType, deletedAt: null },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true, faculty: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.forumPost.count({ where: { forumType, deletedAt: null } }),
  ]);

  return { posts, total, totalPages: Math.ceil(total / limit) };
}

export async function createPost(userId: string, forumType: string, content: string) {
  if (forumType !== 'global') {
    const faculty = await getUserFaculty(userId);
    if (facultySlug(faculty) !== forumType) {
      throw new AppError('Cannot post in another faculty forum', 403);
    }
  }

  return prisma.forumPost.create({
    data: { userId, forumType, content },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

export async function togglePostLike(postId: string, userId: string) {
  const post = await prisma.forumPost.findFirst({ where: { id: postId, deletedAt: null } });
  if (!post) throw new AppError('Post not found', 404);

  const existing = await prisma.forumPostLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.forumPostLike.delete({ where: { postId_userId: { postId, userId } } });
    return { liked: false };
  }

  await prisma.forumPostLike.create({ data: { postId, userId } });
  return { liked: true };
}

export async function getComments(postId: string) {
  return prisma.forumComment.findMany({
    where: { postId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true } },
    },
  });
}

export async function createComment(postId: string, userId: string, content: string) {
  const post = await prisma.forumPost.findFirst({ where: { id: postId, deletedAt: null } });
  if (!post) throw new AppError('Post not found', 404);

  return prisma.forumComment.create({
    data: { postId, userId, content },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true } },
    },
  });
}

export async function toggleCommentLike(commentId: string, userId: string) {
  const comment = await prisma.forumComment.findFirst({ where: { id: commentId, deletedAt: null } });
  if (!comment) throw new AppError('Comment not found', 404);

  const existing = await prisma.forumCommentLike.findUnique({
    where: { commentId_userId: { commentId, userId } },
  });

  if (existing) {
    await prisma.forumCommentLike.delete({ where: { commentId_userId: { commentId, userId } } });
    return { liked: false };
  }

  await prisma.forumCommentLike.create({ data: { commentId, userId } });
  return { liked: true };
}
