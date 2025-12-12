import express from 'express';
import { handleUpload, uploadMiddleware } from '../controllers/upload.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, uploadMiddleware, handleUpload);

export default router;
