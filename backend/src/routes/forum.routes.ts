import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as forumController from '../controllers/forum.controller';

const router = Router();

router.use(authenticate);

router.get('/list',                     forumController.getForumList);
router.get('/posts',                    forumController.getPosts);
router.post('/posts',                   forumController.createPost);
router.post('/posts/:id/like',          forumController.togglePostLike);
router.get('/posts/:id/comments',       forumController.getComments);
router.post('/posts/:id/comments',      forumController.createComment);
router.post('/comments/:id/like',       forumController.toggleCommentLike);

export default router;
