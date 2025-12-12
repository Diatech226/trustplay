import express from 'express';
import { handleUpload, uploadMiddleware } from '../controllers/upload.controller.js';

const router = express.Router();

router.post('/', uploadMiddleware.single('image'), handleUpload);

export default router;
