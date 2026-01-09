import express from 'express';
import {
  create,
  deletepost,
  getpost,
  getposts,
  updatepost,
  updatePostStatus,
} from '../controllers/post.controller.js';
import { requireAdmin, verifyToken, verifyTokenOptional } from '../utils/verifyUser.js';

// REST-friendly alias routes that mirror legacy /api/post endpoints
const router = express.Router();

router.get('/', verifyTokenOptional, getposts);
router.get('/:postId', verifyTokenOptional, getpost);
router.post('/', verifyToken, requireAdmin, create);
router.put('/:postId', verifyToken, requireAdmin, updatepost);
router.delete('/:postId', verifyToken, requireAdmin, deletepost);
router.patch('/:postId/status', verifyToken, requireAdmin, updatePostStatus);

export default router;
