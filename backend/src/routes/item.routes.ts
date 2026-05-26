import { Router } from 'express';
import { itemController } from '../controllers/item.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.use(authenticate);

router.get('/catalog', itemController.getCatalog);
router.get('/', itemController.getInventory);
router.post('/use', itemController.useItem);

export default router;
