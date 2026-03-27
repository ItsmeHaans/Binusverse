import express from 'express';
import cors from 'cors';
import { env } from './config/env';

import authRoutes        from './routes/auth.routes';
import userRoutes        from './routes/user.routes';
import battleRoutes      from './routes/battle.routes';
import quizRoutes        from './routes/quiz.routes';
import learnRoutes       from './routes/learn.routes';
import forumRoutes       from './routes/forum.routes';
import newsRoutes        from './routes/news.routes';
import leaderboardRoutes from './routes/leaderboard.routes';

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth',        authRoutes);
app.use('/api/user',        userRoutes);
app.use('/api/users',       userRoutes);   // /api/users/search
app.use('/api/missions',    userRoutes);   // /api/missions (CRUD)
app.use('/api/battle',      battleRoutes);
app.use('/api/quiz',        quizRoutes);
app.use('/api/learn',       learnRoutes);
app.use('/api/forum',       forumRoutes);
app.use('/api/news',        newsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
