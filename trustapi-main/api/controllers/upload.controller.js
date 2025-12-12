import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
const absoluteUploadPath = path.join(path.resolve(), uploadsDir);

if (!fs.existsSync(absoluteUploadPath)) {
  fs.mkdirSync(absoluteUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, absoluteUploadPath);
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname) || '.bin';
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

export const uploadMiddleware = multer({ storage });

export const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const publicPath = `/uploads/${req.file.filename}`;
  const absolutePath = path.join(absoluteUploadPath, req.file.filename);

  return res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: publicPath,
      path: absolutePath,
    },
  });
};
