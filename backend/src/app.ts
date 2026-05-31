import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import quizRoutes from './routes/quiz.routes';
import battleRoutes from './routes/battle.routes';
import itemRoutes from './routes/item.routes';
import forumRoutes from './routes/forum.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import newsRoutes from './routes/news.routes';

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Global rate limit — 200 req/15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Stricter limit for auth endpoints
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
}));

// Stricter limit for quiz submission (prevent XP farming)
app.use('/api/quiz/submit', rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Slow down, adventurer.' },
}));

app.get('/health', async (_req, res) => {
  try {
    const { default: prisma } = await import('./prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unreachable', timestamp: new Date().toISOString() });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/news', newsRoutes);

app.use(errorHandler);

export default app;
