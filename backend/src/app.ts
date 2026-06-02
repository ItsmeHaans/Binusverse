import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import quizRoutes from './routes/quiz.routes';
import battleRoutes from './routes/battle.routes';
import itemRoutes from './routes/item.routes';
import forumRoutes from './routes/forum.routes';

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/forum', forumRoutes);

app.use(errorHandler);

export default app;
