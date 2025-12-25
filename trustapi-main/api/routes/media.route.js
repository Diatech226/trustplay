import express from 'express';
import { createMedia, deleteMedia, listMedia, updateMedia } from '../controllers/media.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', verifyToken, listMedia);
router.post('/', verifyToken, createMedia);
router.delete('/:id', verifyToken, deleteMedia);
router.put('/:id', verifyToken, updateMedia);

export default router;
