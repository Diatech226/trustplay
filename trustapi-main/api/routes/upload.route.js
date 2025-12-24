import express from 'express';
import multer from 'multer';
import { handleUpload, listUploads, uploadMiddleware } from '../controllers/upload.controller.js';
import { requireAdmin, verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Fichier trop volumineux (max 100MB)'
            : 'Type de fichier non supporté';
        return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, message });
      }
      return next(err);
    }
    return handleUpload(req, res, next);
  });
});

router.get('/list', verifyToken, requireAdmin, listUploads);

export default router;
