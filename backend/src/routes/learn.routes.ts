import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as learnController from '../controllers/learn.controller';

const router = Router();

router.use(authenticate);

router.post('/analyze',          learnController.analyzePerformance);
router.post('/suggest-videos',   learnController.suggestVideos);
router.get('/skill-upgrades',    learnController.getSkillUpgrades);

export default router;
