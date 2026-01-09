import express from 'express';
import { requireAdmin, verifyToken, verifyTokenOptional } from '../utils/verifyUser.js';
import {
  create,
  deletepost,
  getpost,
  getposts,
  updatepost,
  updatePostStatus,
} from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, requireAdmin, create);
router.get('/getposts', verifyTokenOptional, getposts);
router.get('/:postId', verifyTokenOptional, getpost);
router.delete('/deletepost/:postId/:userId', verifyToken, requireAdmin, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, requireAdmin, updatepost);
router.patch('/:postId/status', verifyToken, requireAdmin, updatePostStatus);

export default router;
