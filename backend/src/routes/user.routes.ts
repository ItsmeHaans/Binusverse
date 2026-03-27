import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

// Profile
router.get('/profile',          userController.getProfile);
router.patch('/profile',        userController.updateProfile);
router.patch('/bio',            userController.updateBio);

// Academic
router.get('/academic-status',  userController.getAcademicStatus);
router.patch('/academic-status',userController.updateAcademicStatus);
router.get('/gpa-history',      userController.getGpaHistory);
router.post('/gpa-history',     userController.addGpaHistory);
router.get('/classes',          userController.getClasses);
router.post('/classes',         userController.addClass);

// Missions
router.get('/missions',         userController.getMissions);
router.post('/missions',        userController.createMission);
router.patch('/missions/:id',   userController.updateMission);

// Search (mounted at /api/users/search)
router.get('/search',           userController.searchUsers);

export default router;
