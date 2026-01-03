import express from 'express';
import { getEvents } from '../controllers/events.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', verifyToken, getEvents);

export default router;
