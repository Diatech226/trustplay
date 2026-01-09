import express from 'express';
import {
  createMedia,
  deleteMedia,
  getMedia,
  listMedia,
  requireMediaOwnerOrAdmin,
  updateMedia,
  uploadMedia,
  uploadMediaMiddleware,
} from '../controllers/media.controller.js';
import { requireAdmin, verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/upload', verifyToken, requireAdmin, uploadMediaMiddleware, uploadMedia);
router.get('/', verifyToken, requireAdmin, listMedia);
router.get('/:id', verifyToken, requireAdmin, getMedia);
router.post('/', verifyToken, requireAdmin, createMedia);
router.delete('/:id', verifyToken, requireAdmin, requireMediaOwnerOrAdmin, deleteMedia);
router.put('/:id', verifyToken, requireAdmin, requireMediaOwnerOrAdmin, updateMedia);

export default router;
