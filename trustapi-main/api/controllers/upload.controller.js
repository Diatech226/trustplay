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

const upload = multer({ storage });

export const uploadMiddleware = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

export const handleUpload = (req, res) => {
  const uploadedFile = req.files?.image?.[0] || req.files?.file?.[0];

  if (!uploadedFile) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const publicPath = `/uploads/${uploadedFile.filename}`;
  const absolutePath = path.join(absoluteUploadPath, uploadedFile.filename);

  return res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      filename: uploadedFile.filename,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
      url: publicPath,
      path: absolutePath,
    },
  });
};
