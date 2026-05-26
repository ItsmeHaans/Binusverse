import { Router } from 'express';
import { newsController } from '../controllers/news.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(authenticate);

router.get('/', newsController.getAll);
router.get('/:id', newsController.getById);
router.post('/', requireAdmin, newsController.create);
router.patch('/:id', requireAdmin, newsController.update);
router.delete('/:id', requireAdmin, newsController.delete);

export default router;
