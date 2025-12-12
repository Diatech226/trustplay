import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadsDir = process.env.UPLOAD_DIR || './public/uploads';
export const absoluteUploadPath = path.isAbsolute(uploadsDir)
  ? uploadsDir
  : path.join(path.resolve(), uploadsDir);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

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
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (_, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
    }
    cb(null, true);
  },
});

export const uploadMiddleware = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

const buildResponsePayload = (file) => {
  const isImage = file.mimetype.startsWith('image/');
  return {
    success: true,
    data: {
      url: `/uploads/${file.filename}`,
      name: file.filename,
      mime: file.mimetype,
      size: file.size,
      type: isImage ? 'image' : 'video',
    },
  };
};

export const handleUpload = (req, res) => {
  const uploadedFile = req.files?.file?.[0] || req.files?.image?.[0];

  if (!uploadedFile) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const isImage = uploadedFile.mimetype.startsWith('image/');
  if (isImage && uploadedFile.size > MAX_IMAGE_SIZE) {
    fs.unlink(uploadedFile.path, () => {});
    return res
      .status(400)
      .json({ success: false, message: 'Image too large (max 10MB)' });
  }

  return res.status(201).json(buildResponsePayload(uploadedFile));
};
