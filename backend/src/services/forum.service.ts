import { forumRepository } from '../repositories/forum.repository';
import { AppError } from '../utils/AppError';
import { stripHtml } from '../utils/sanitize';

const VALID_CHANNEL_IDS = new Set(['global', 'cs-guild', 'engineering']);

export const forumService = {
  getPosts(channel: string, page: number = 1, pageSize: number = 20) {
    return forumRepository.getPosts(channel, page, pageSize);
  },

  createPost(userId: string, channel: string, content: string) {
    if (!VALID_CHANNEL_IDS.has(channel)) throw new AppError('Invalid channel', 400);
    return forumRepository.createPost(userId, channel, stripHtml(content));
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
};
