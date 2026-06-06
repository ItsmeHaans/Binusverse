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
};
