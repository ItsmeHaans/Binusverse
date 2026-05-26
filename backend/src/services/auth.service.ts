import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      faculty: input.faculty,
      batch: input.batch,
    });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);
    await userRepository.saveRefreshToken(
      refreshToken,
      user.id,
      new Date(Date.now() + REFRESH_EXPIRES_MS),
    );

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);
    await userRepository.saveRefreshToken(
      refreshToken,
      user.id,
      new Date(Date.now() + REFRESH_EXPIRES_MS),
    );

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  },

  async refresh(token: string) {
    const record = await userRepository.findRefreshToken(token);
    if (!record || record.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    verifyRefreshToken(token);

    await userRepository.deleteRefreshToken(token);

    const newRefreshToken = signRefreshToken(record.userId);
    await userRepository.saveRefreshToken(
      newRefreshToken,
      record.userId,
      new Date(Date.now() + REFRESH_EXPIRES_MS),
    );

    const accessToken = signAccessToken(record.userId, record.user.role);
    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(token: string) {
    await userRepository.deleteRefreshToken(token);
  },
};
