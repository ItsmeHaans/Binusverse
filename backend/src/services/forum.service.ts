import { forumRepository } from '../repositories/forum.repository';
import { AppError } from '../utils/AppError';

const CHANNELS = [
  { id: 'global', name: 'Global Channel', description: 'Open to all BINUS students' },
  { id: 'cs-guild', name: 'CS Guild', description: 'Computer Science guild' },
  { id: 'engineering', name: 'Engineering', description: 'Engineering guild' },
];

export const forumService = {
  getChannels() {
    return CHANNELS;
  },

  getPosts(channel: string, page: number = 1, pageSize: number = 20) {
    return forumRepository.getPosts(channel, page, pageSize);
  },

  createPost(userId: string, channel: string, content: string) {
    return forumRepository.createPost(userId, channel, content);
  },

  async togglePostLike(postId: string, userId: string) {
    const existing = await forumRepository.findPostLike(postId, userId);
    if (existing) {
      await forumRepository.deletePostLike(postId, userId);
      return { liked: false };
    }
    await forumRepository.createPostLike(postId, userId);
    return { liked: true };
  },

  getComments(postId: string) {
    return forumRepository.getComments(postId);
  },

  async createComment(postId: string, userId: string, content: string) {
    const post = await forumRepository.findPost(postId);
    if (!post || post.deletedAt) throw new AppError('Post not found', 404);
    return forumRepository.createComment(postId, userId, content);
  },

  async toggleCommentLike(commentId: string, userId: string) {
    const existing = await forumRepository.findCommentLike(commentId, userId);
    if (existing) {
      await forumRepository.deleteCommentLike(commentId, userId);
      return { liked: false };
    }
    await forumRepository.createCommentLike(commentId, userId);
    return { liked: true };
  },
};
