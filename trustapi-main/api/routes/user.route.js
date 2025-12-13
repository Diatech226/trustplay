import express from 'express';
import {
  deleteUser,
  getUser,
  getUsers,
  getMe,
  test,
  updateUser,
} from '../controllers/user.controller.js';
import { requireAdmin, verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.get('/getusers', verifyToken, requireAdmin, getUsers);
router.get('/me', verifyToken, getMe);
router.get('/:userId', getUser);

export default router;
