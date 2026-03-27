import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as battleController from '../controllers/battle.controller';

const router = Router();

router.use(authenticate);

// PvP
router.post('/pvp/challenge',       battleController.createPvpChallenge);
router.get('/pvp/:id/questions',    battleController.getPvpQuestions);
router.post('/pvp/:id/answer',      battleController.submitPvpAnswer);
router.get('/pvp/:id/result',       battleController.getPvpResult);

// Raid
router.get('/raid/questions',       battleController.getRaidQuestions);
router.post('/raid/submit',         battleController.submitRaid);

export default router;
