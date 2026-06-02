import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { xpToLevel } from '../utils/xp';
import { xpToRank } from '../utils/rank';

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
      rank: xpToRank(user.xp),
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

  // Full frontend progression blob (BVUser shape). Stored verbatim in user.gameState.
  async getState(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user.gameState ?? {};
  },

  async saveState(userId: string, state: Record<string, unknown>) {
    // Mirror the headline numbers onto first-class columns so other features
    // (auth/battle/leaderboards) stay consistent with the FE-authoritative blob.
    const totalXP = typeof state['totalXP'] === 'number' ? (state['totalXP'] as number) : undefined;
    const streak = typeof state['streak'] === 'number' ? (state['streak'] as number) : undefined;

    await userRepository.update(userId, {
      gameState: state as any,
      ...(totalXP !== undefined && { xp: totalXP, level: xpToLevel(totalXP) }),
      ...(streak !== undefined && { streak }),
    });
    return state;
  },

  searchUsers(query: string) {
    return userRepository.search(query);
  },
};
