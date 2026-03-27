import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import * as newsController from '../controllers/news.controller';

const router = Router();

// Public
router.get('/',    newsController.getNews);
router.get('/:id', newsController.getNewsById);

// Admin only
router.post('/',    authenticate, requireAdmin, newsController.createNews);
router.patch('/:id',  authenticate, requireAdmin, newsController.updateNews);
router.delete('/:id', authenticate, requireAdmin, newsController.deleteNews);

export default router;
