import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { updateProfileSchema, updateBioSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.patch('/bio', validate(updateBioSchema), userController.updateBio);

// Full frontend progression blob (BVUser).
router.get('/state', userController.getState);
router.put('/state', userController.saveState);

router.get('/search', userController.searchUsers);

export default router;
