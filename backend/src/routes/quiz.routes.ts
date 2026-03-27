import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import * as quizController from '../controllers/quiz.controller';

const router = Router();

router.use(authenticate);

router.get('/daily',         quizController.getDailyQuiz);
router.post('/daily/submit', quizController.submitDailyQuiz);
router.post('/generate',     requireAdmin, quizController.generateQuiz);

export default router;
