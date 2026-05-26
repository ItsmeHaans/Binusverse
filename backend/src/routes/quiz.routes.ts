import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';
import { validate } from '../middlewares/validate';
import { submitDailySchema, addQuestionSchema } from '../validators/quiz.validator';

const router = Router();

router.use(authenticate);

router.get('/daily', quizController.getDaily);
router.post('/daily/submit', validate(submitDailySchema), quizController.submitDaily);
router.post('/questions', requireAdmin, validate(addQuestionSchema), quizController.addQuestion);

export default router;
