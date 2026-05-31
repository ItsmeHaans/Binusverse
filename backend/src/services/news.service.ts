import { newsRepository } from '../repositories/news.repository';
import { AppError } from '../utils/AppError';
import { stripHtml } from '../utils/sanitize';

export const newsService = {
  getAll(page: number = 1) {
    return newsRepository.getAll(page, 10);
  },

  async getById(id: string) {
    const news = await newsRepository.findById(id);
    if (!news) throw new AppError('News not found', 404);
    return news;
  },

  create(authorId: string, data: { title: string; content: string; imageUrl?: string }) {
    return newsRepository.create({
      title: stripHtml(data.title),
      content: stripHtml(data.content),
      imageUrl: data.imageUrl,
      authorId,
    });
  },

  async update(id: string, data: { title?: string; content?: string; imageUrl?: string }) {
    const news = await newsRepository.findById(id);
    if (!news) throw new AppError('News not found', 404);
    return newsRepository.update(id, {
      title:   data.title   !== undefined ? stripHtml(data.title)   : undefined,
      content: data.content !== undefined ? stripHtml(data.content) : undefined,
      imageUrl: data.imageUrl,
    });
  },

  async delete(id: string) {
    const news = await newsRepository.findById(id);
    if (!news) throw new AppError('News not found', 404);
    return newsRepository.delete(id);
  },
};
