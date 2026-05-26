import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import {
  updateProfileSchema,
  updateBioSchema,
  updateAcademicSchema,
  addGpaHistorySchema,
  addClassSchema,
  createMissionSchema,
  updateMissionSchema,
} from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.patch('/bio', validate(updateBioSchema), userController.updateBio);

router.get('/academic', userController.getAcademic);
router.patch('/academic', validate(updateAcademicSchema), userController.updateAcademic);

router.get('/gpa-history', userController.getGpaHistory);
router.post('/gpa-history', validate(addGpaHistorySchema), userController.addGpaHistory);

router.get('/classes', userController.getClasses);
router.post('/classes', validate(addClassSchema), userController.addClass);

router.get('/missions', userController.getMissions);
router.post('/missions', validate(createMissionSchema), userController.createMission);
router.patch('/missions/:id', validate(updateMissionSchema), userController.updateMission);

router.get('/search', userController.searchUsers);

export default router;
