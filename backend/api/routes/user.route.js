import express from 'express';
import {
  deleteUser,
  getUser,
  getUsers,
  getMe,
  promoteUser,
  updateUserRole,
  test,
  updateUser,
} from '../controllers/user.controller.js';
import { createAdminUser, toggleAdminUser, updateAdminUser } from '../controllers/adminUsers.controller.js';
import { requireAdmin, verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test', test);
router.post('/admin-create', verifyToken, requireAdmin, createAdminUser);
router.post('/create', verifyToken, requireAdmin, createAdminUser);
router.put('/update/:userId', verifyToken, updateUser);
router.put('/:id', verifyToken, requireAdmin, updateAdminUser);
router.put('/:id/toggle-admin', verifyToken, requireAdmin, toggleAdminUser);
router.patch('/:id/promote', verifyToken, requireAdmin, promoteUser);
router.patch('/:id/role', verifyToken, requireAdmin, updateUserRole);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.get('/getusers', verifyToken, requireAdmin, getUsers);
router.get('/me', verifyToken, getMe);
router.get('/:userId', getUser);

export default router;
