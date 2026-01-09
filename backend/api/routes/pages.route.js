import express from 'express';
import { requireAdmin, verifyToken } from '../utils/verifyUser.js';
import {
  createPage,
  deletePage,
  getPage,
  getPages,
  updatePage,
  updatePageStatus,
} from '../controllers/pages.controller.js';

const router = express.Router();

router.get('/', verifyToken, requireAdmin, getPages);
router.get('/:pageId', verifyToken, requireAdmin, getPage);
router.post('/', verifyToken, requireAdmin, createPage);
router.put('/:pageId', verifyToken, requireAdmin, updatePage);
router.patch('/:pageId/status', verifyToken, requireAdmin, updatePageStatus);
router.delete('/:pageId', verifyToken, requireAdmin, deletePage);

export default router;
