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
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/upload', verifyToken, uploadMediaMiddleware, uploadMedia);
router.get('/', verifyToken, listMedia);
router.get('/:id', verifyToken, getMedia);
router.post('/', verifyToken, createMedia);
router.delete('/:id', verifyToken, requireMediaOwnerOrAdmin, deleteMedia);
router.put('/:id', verifyToken, requireMediaOwnerOrAdmin, updateMedia);

export default router;
