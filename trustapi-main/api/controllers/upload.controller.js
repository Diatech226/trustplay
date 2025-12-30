import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import Media from '../models/media.model.js';

const uploadsDir = process.env.UPLOAD_DIR || './uploads';
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
const IMAGE_VARIANTS = [
  { key: 'thumb', width: 400 },
  { key: 'medium', width: 900 },
  { key: 'cover', width: 1400 },
];

const EXTENSION_MIME_MAP = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.mp4', 'video/mp4'],
  ['.webm', 'video/webm'],
]);

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
    const baseName = file.mimetype.startsWith('image/') ? `${uniqueSuffix}-original` : uniqueSuffix;
    cb(null, `${baseName}${extension}`);
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

const parseTags = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((tag) => tag?.toString().trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const resolveKind = (mime) => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'file';
};

const logUpload = (context) => {
  if (process.env.NODE_ENV === 'production') return;
  console.info('[UPLOAD]', context);
};

const buildResponsePayload = (file, media, extra = {}) => {
  const isImage = file.mimetype.startsWith('image/');
  const baseUrl = extra.originalUrl || `/uploads/${file.filename}`;
  return {
    success: true,
    media,
    data: {
      url: baseUrl,
      name: file.originalname,
      mime: file.mimetype,
      size: file.size,
      type: isImage ? 'image' : 'video',
      media,
      ...extra,
    },
    url: baseUrl,
    name: file.originalname,
    mime: file.mimetype,
  };
};

const getBaseName = (filename) => {
  const raw = path.basename(filename, path.extname(filename));
  return raw.endsWith('-original') ? raw.slice(0, -'-original'.length) : raw;
};

const generateImageVariants = async (filePath, filename) => {
  const baseName = getBaseName(filename);
  const metadata = await sharp(filePath).metadata();

  const variants = await Promise.all(
    IMAGE_VARIANTS.map(async ({ key, width }) => {
      const webpName = `${baseName}-${key}.webp`;
      const avifName = `${baseName}-${key}.avif`;
      const webpPath = path.join(absoluteUploadPath, webpName);
      const avifPath = path.join(absoluteUploadPath, avifName);

      await sharp(filePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(webpPath);

      await sharp(filePath)
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: 50 })
        .toFile(avifPath);

      return {
        key,
        webpUrl: `/uploads/${webpName}`,
        avifUrl: `/uploads/${avifName}`,
      };
    })
  );

  const variantMap = variants.reduce(
    (acc, item) => {
      acc[`${item.key}Url`] = item.webpUrl;
      acc[`${item.key}AvifUrl`] = item.avifUrl;
      return acc;
    },
    {}
  );

  return {
    ...variantMap,
    width: metadata.width,
    height: metadata.height,
  };
};

export const handleUpload = async (req, res, next) => {
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

  try {
    logUpload({
      userId: req.user?.id || req.user?._id,
      mime: uploadedFile.mimetype,
      size: uploadedFile.size,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalname,
    });
    const originalUrl = `/uploads/${uploadedFile.filename}`;
    const variants = isImage ? await generateImageVariants(uploadedFile.path, uploadedFile.filename) : {};
    const mediaPayload = {
      name: req.body?.name || uploadedFile.originalname,
      category: req.body?.category || 'gallery',
      subCategory: req.body?.subCategory || null,
      url: originalUrl,
      originalUrl: isImage ? originalUrl : undefined,
      thumbUrl: isImage ? variants.thumbUrl : undefined,
      coverUrl: isImage ? variants.coverUrl : undefined,
      mediumUrl: isImage ? variants.mediumUrl : undefined,
      thumbAvifUrl: isImage ? variants.thumbAvifUrl : undefined,
      coverAvifUrl: isImage ? variants.coverAvifUrl : undefined,
      mediumAvifUrl: isImage ? variants.mediumAvifUrl : undefined,
      width: isImage ? variants.width : undefined,
      height: isImage ? variants.height : undefined,
      mimeType: uploadedFile.mimetype,
      size: uploadedFile.size,
      kind: resolveKind(uploadedFile.mimetype),
      uploadedBy: req.user?.id || req.user?._id,
      altText: req.body?.altText,
      tags: parseTags(req.body?.tags),
    };

    const media = await Media.create(mediaPayload);
    return res.status(201).json(
      buildResponsePayload(uploadedFile, media, {
        originalUrl,
        thumbUrl: variants.thumbUrl,
        coverUrl: variants.coverUrl,
        mediumUrl: variants.mediumUrl,
        thumbAvifUrl: variants.thumbAvifUrl,
        coverAvifUrl: variants.coverAvifUrl,
        mediumAvifUrl: variants.mediumAvifUrl,
        width: variants.width,
        height: variants.height,
      })
    );
  } catch (error) {
    return next(error);
  }
};

const resolveMimeType = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  return EXTENSION_MIME_MAP.get(extension) || 'application/octet-stream';
};

const resolveAssetType = (mime) => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'file';
};

export const listUploads = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const cursor = req.query.cursor ? Number(req.query.cursor) : null;

    const entries = await fs.promises.readdir(absoluteUploadPath, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map(async (entry) => {
          const filePath = path.join(absoluteUploadPath, entry.name);
          const stats = await fs.promises.stat(filePath);
          const mime = resolveMimeType(entry.name);
          return {
            name: entry.name,
            url: `/uploads/${entry.name}`,
            mime,
            size: stats.size,
            createdAt: stats.birthtime?.toISOString() || stats.mtime.toISOString(),
            updatedAt: stats.mtime.toISOString(),
            type: resolveAssetType(mime),
            mtimeMs: stats.mtimeMs,
          };
        })
    );

    const filtered = cursor ? files.filter((file) => file.mtimeMs < cursor) : files;
    filtered.sort((a, b) => b.mtimeMs - a.mtimeMs);

    const limited = filtered.slice(0, limit);
    const nextCursor = filtered.length > limit ? limited[limited.length - 1]?.mtimeMs : null;
    const payload = limited.map(({ mtimeMs, ...rest }) => rest);

    res.status(200).json({
      success: true,
      files: payload,
      nextCursor,
      data: { files: payload, nextCursor },
    });
  } catch (error) {
    next(error);
  }
};
