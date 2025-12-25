import express from 'express';
import {
  createRubric,
  deleteRubric,
  listRubrics,
  updateRubric,
} from '../controllers/rubrics.controller.js';
import { requireAdmin, verifyTokenOptional, verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', verifyTokenOptional, listRubrics);
router.post('/', verifyToken, requireAdmin, createRubric);
router.put('/:id', verifyToken, requireAdmin, updateRubric);
router.delete('/:id', verifyToken, requireAdmin, deleteRubric);

export default router;
