import express from 'express';
import { create, deletepost, getpost, getposts, updatepost } from '../controllers/post.controller.js';
import { verifyToken, verifyTokenOptional } from '../utils/verifyUser.js';

// REST-friendly alias routes that mirror legacy /api/post endpoints
const router = express.Router();

router.get('/', verifyTokenOptional, getposts);
router.get('/:postId', verifyTokenOptional, getpost);
router.post('/', verifyToken, create);
router.put('/:postId', verifyToken, updatepost);
router.delete('/:postId', verifyToken, deletepost);

export default router;
