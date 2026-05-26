import { Router } from 'express';
import { forumController } from '../controllers/forum.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { createPostSchema, createCommentSchema } from '../validators/forum.validator';

const router = Router();

router.use(authenticate);

router.get('/channels', forumController.getChannels);
router.get('/posts', forumController.getPosts);
router.post('/posts', validate(createPostSchema), forumController.createPost);
router.post('/posts/:id/like', forumController.togglePostLike);
router.get('/posts/:id/comments', forumController.getComments);
router.post('/posts/:id/comments', validate(createCommentSchema), forumController.createComment);
router.post('/comments/:id/like', forumController.toggleCommentLike);

export default router;
