import { Router } from 'express';
import { forumController } from '../controllers/forum.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { createPostSchema } from '../validators/forum.validator';

const router = Router();

router.use(authenticate);

router.get('/posts', forumController.getPosts);
router.post('/posts', validate(createPostSchema), forumController.createPost);
router.post('/posts/:id/like', forumController.togglePostLike);

export default router;
