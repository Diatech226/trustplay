import express from 'express';
import { getAnalyticsSummary, logEvent } from '../controllers/analytics.controller.js';
import { requireRoles } from '../utils/roles.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/events', logEvent);
router.get('/summary', verifyToken, requireRoles(), getAnalyticsSummary);

export default router;
