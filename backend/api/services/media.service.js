import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import mongoose from 'mongoose';
import Media from '../models/media.model.js';

const uploadsDir = process.env.UPLOAD_DIR || './uploads';
export const absoluteUploadPath = path.isAbsolute(uploadsDir)
  ? uploadsDir
  : path.join(path.resolve(), uploadsDir);

const IMAGE_VARIANTS = [
  { key: 'thumb', width: 400 },
  { key: 'card', width: 800 },
  { key: 'cover', width: 1600 },
  { key: 'og', width: 1200, height: 630, fit: 'cover' },
];

const EXTENSION_BY_MIME = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
  ['video/mp4', '.mp4'],
  ['video/webm', '.webm'],
]);

if (!fs.existsSync(absoluteUploadPath)) {
  fs.mkdirSync(absoluteUploadPath, { recursive: true });
}

export const resolvePublicUrl = (filename) => `/uploads/${filename}`;

const resolveExtension = (file) => {
  const originalExt = path.extname(file.originalname || '');
  if (originalExt) return originalExt.toLowerCase();
  return EXTENSION_BY_MIME.get(file.mimetype) || '.bin';
};

const getFileStats = async (filePath) => {
  try {
    return await fs.promises.stat(filePath);
  } catch (error) {
    return null;
  }
};

export const generateImageVariants = async (filePath, mediaId) => {
  const variants = {};
  for (const variant of IMAGE_VARIANTS) {
    const filename = `${mediaId}-${variant.key}.webp`;
    const outputPath = path.join(absoluteUploadPath, filename);
    const transformer = sharp(filePath).resize({
      width: variant.width,
      height: variant.height,
      fit: variant.fit || 'inside',
      withoutEnlargement: true,
    });
    await transformer.webp({ quality: 82 }).toFile(outputPath);
    const metadata = await sharp(outputPath).metadata();
    const stats = await getFileStats(outputPath);
    variants[variant.key] = {
      url: resolvePublicUrl(filename),
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats?.size,
    };
  }
  return variants;
};

export const createMediaFromUpload = async (file, user, payload = {}) => {
  const mediaId = payload.mediaId || new mongoose.Types.ObjectId();
  const isImage = file.mimetype.startsWith('image/');
  const originalFilename = `${mediaId}-original${resolveExtension(file)}`;
  const originalUrl = resolvePublicUrl(originalFilename);
  const originalPath = path.join(absoluteUploadPath, originalFilename);

  if (file.path !== originalPath) {
    await fs.promises.rename(file.path, originalPath);
  }

  let originalMetadata = {};
  let variants = {};
  if (isImage) {
    const metadata = await sharp(originalPath).metadata();
    const stats = await getFileStats(originalPath);
    originalMetadata = {
      url: originalUrl,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats?.size || file.size,
    };
    variants = await generateImageVariants(originalPath, mediaId);
  } else {
    originalMetadata = {
      url: originalUrl,
      format: file.mimetype,
      size: file.size,
    };
  }

  const tags = payload.tags || [];
  const mediaPayload = {
    type: isImage ? 'image' : 'video',
    title: payload.title || payload.name || file.originalname,
    alt: payload.alt || payload.altText || '',
    caption: payload.caption,
    credit: payload.credit,
    category: payload.category || 'news',
    tags,
    status: payload.status || 'published',
    original: originalMetadata,
    variants,
    createdBy: user?.id || user?._id,
    name: payload.title || payload.name || file.originalname,
    subCategory: payload.subCategory,
    url: originalUrl,
    originalUrl: originalUrl,
    thumbUrl: variants.thumb?.url,
    coverUrl: variants.cover?.url,
    mediumUrl: variants.card?.url,
    mimeType: file.mimetype,
    size: file.size,
    width: originalMetadata.width,
    height: originalMetadata.height,
    kind: isImage ? 'image' : 'video',
    uploadedBy: user?.id || user?._id,
    altText: payload.alt || payload.altText,
  };

  return Media.create(mediaPayload);
};

export const removeMediaFiles = async (media) => {
  if (!media) return;
  const urls = new Set();
  if (media.original?.url) urls.add(media.original.url);
  if (media.variants) {
    Object.values(media.variants).forEach((variant) => {
      if (variant?.url) urls.add(variant.url);
    });
  }
  if (media.url) urls.add(media.url);
  if (media.originalUrl) urls.add(media.originalUrl);
  if (media.thumbUrl) urls.add(media.thumbUrl);
  if (media.coverUrl) urls.add(media.coverUrl);
  if (media.mediumUrl) urls.add(media.mediumUrl);

  await Promise.all(
    Array.from(urls).map(async (url) => {
      if (!url) return;
      const filename = url.replace(/^.*\/uploads\//, '');
      if (!filename) return;
      const filePath = path.join(absoluteUploadPath, filename);
      try {
        await fs.promises.unlink(filePath);
      } catch (error) {
        // ignore missing files
      }
    })
  );
};
