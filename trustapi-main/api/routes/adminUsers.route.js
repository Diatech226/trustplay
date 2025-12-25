import express from 'express';
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUser,
  listAdminUsers,
  toggleAdminUser,
  updateAdminUser,
  updateAdminUserRole,
} from '../controllers/adminUsers.controller.js';
import { requireAdmin, verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/users', verifyToken, requireAdmin, createAdminUser);
router.get('/users', verifyToken, requireAdmin, listAdminUsers);
router.get('/users/:id', verifyToken, requireAdmin, getAdminUser);
router.put('/users/:id', verifyToken, requireAdmin, updateAdminUser);
router.delete('/users/:id', verifyToken, requireAdmin, deleteAdminUser);
router.put('/users/:id/role', verifyToken, requireAdmin, updateAdminUserRole);
router.put('/users/:id/toggle-admin', verifyToken, requireAdmin, toggleAdminUser);

export default router;
