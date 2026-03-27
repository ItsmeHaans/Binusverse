import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as leaderboardController from '../controllers/leaderboard.controller';

const router = Router();

router.use(authenticate);

router.get('/', leaderboardController.getLeaderboard);

export default router;
