import { Router } from 'express';
import { battleController } from '../controllers/battle.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { raidSubmitSchema, pvpChallengeSchema, pvpAnswerSchema } from '../validators/battle.validator';

const router = Router();

router.use(authenticate);

router.get('/raid/questions', battleController.getRaidQuestions);
router.post('/raid/submit', validate(raidSubmitSchema), battleController.submitRaid);

router.post('/pvp/challenge', validate(pvpChallengeSchema), battleController.createPvpSession);
router.get('/pvp/:id/questions', battleController.getPvpQuestions);
router.post('/pvp/:id/answer', validate(pvpAnswerSchema), battleController.submitPvpAnswer);
router.get('/pvp/:id/result', battleController.getPvpResult);

router.get('/history', battleController.getHistory);

export default router;
