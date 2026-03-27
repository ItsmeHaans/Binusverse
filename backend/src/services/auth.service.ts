import bcrypt from 'bcryptjs';
import prisma from '../prismaClient';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export async function register(
  name: string,
  email: string,
  password: string,
  batch: string,
  faculty: string
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, batch, faculty, level: 1, xp: 0, streak: 0, gpa: 0.0, eloPoints: 1000 },
    select: { id: true, name: true, email: true, faculty: true, batch: true, role: true },
  });

  const tokens = await _issueTokens(user.id, user.role);
  return { user, ...tokens };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid email or password', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  const tokens = await _issueTokens(user.id, user.role);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

export async function refresh(token: string) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const accessToken = signAccessToken({ id: payload.id, role: payload.role });
  return { accessToken };
}

export async function logout(refreshToken?: string) {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
}

async function _issueTokens(userId: string, role: string) {
  const accessToken = signAccessToken({ id: userId, role: role as never });
  const refreshToken = signRefreshToken({ id: userId, role: role as never });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId, expiresAt } });

  return { accessToken, refreshToken };
}
