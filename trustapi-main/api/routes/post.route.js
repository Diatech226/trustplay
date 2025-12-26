import express from 'express';
import { verifyToken, verifyTokenOptional } from '../utils/verifyUser.js';
import {
  create,
  deletepost,
  getpost,
  getposts,
  updatepost,
  updatePostStatus,
} from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create);
router.get('/getposts', verifyTokenOptional, getposts);
router.get('/:postId', verifyTokenOptional, getpost);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);
router.patch('/:postId/status', verifyToken, updatePostStatus);

export default router;
