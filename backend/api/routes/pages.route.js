import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  createPage,
  deletePage,
  getPage,
  getPages,
  updatePage,
  updatePageStatus,
} from '../controllers/pages.controller.js';

const router = express.Router();

router.get('/', verifyToken, getPages);
router.get('/:pageId', verifyToken, getPage);
router.post('/', verifyToken, createPage);
router.put('/:pageId', verifyToken, updatePage);
router.patch('/:pageId/status', verifyToken, updatePageStatus);
router.delete('/:pageId', verifyToken, deletePage);

export default router;
