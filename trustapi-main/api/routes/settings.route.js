import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { requireAdmin, verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', verifyToken, requireAdmin, updateSettings);

export default router;
