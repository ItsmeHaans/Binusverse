import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { xpToLevel } from '../utils/xp';
import { eloToDivision } from '../utils/rank';

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      faculty: user.faculty,
      batch: user.batch,
      level: xpToLevel(user.xp),
      xp: user.xp,
      streak: user.streak,
      eloPoints: user.eloPoints,
      division: eloToDivision(user.eloPoints),
      role: user.role,
      createdAt: user.createdAt,
    };
  },

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    return userRepository.update(userId, data);
  },

  async updateBio(userId: string, bio: string) {
    return userRepository.update(userId, { bio });
  },

  async getAcademic(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return { gpa: user.gpa, attendance: user.attendance };
  },

  async updateAcademic(userId: string, data: { gpa?: number; attendance?: number }) {
    return userRepository.update(userId, data);
  },

  getGpaHistory(userId: string) {
    return userRepository.getGpaHistory(userId);
  },

  async addGpaHistory(
    userId: string,
    data: { semester: string; ipValue: number; classesPassed: number; totalClasses: number },
  ) {
    return userRepository.addGpaHistory({ user: { connect: { id: userId } }, ...data });
  },

  getClasses(userId: string, semester?: string) {
    return userRepository.getClasses(userId, semester);
  },

  addClass(userId: string, data: { name: string; code: string; semester: string; passed?: boolean }) {
    return userRepository.addClass({ user: { connect: { id: userId } }, ...data });
  },

  getMissions(userId: string, status?: string) {
    return userRepository.getMissions(userId, status);
  },

  createMission(
    userId: string,
    data: { title: string; description?: string; dueDate?: string; imageUrl?: string },
  ) {
    return userRepository.createMission({
      user: { connect: { id: userId } },
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      imageUrl: data.imageUrl,
    });
  },

  updateMission(
    id: string,
    userId: string,
    data: { title?: string; description?: string; status?: 'ONGOING' | 'DONE'; dueDate?: string },
  ) {
    return userRepository.updateMission(id, userId, {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
  },

  searchUsers(query: string) {
    return userRepository.search(query);
  },
};
