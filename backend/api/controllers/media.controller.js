import fs from 'fs';
import multer from 'multer';
import path from 'path';
import Media from '../models/media.model.js';
import { errorHandler } from '../utils/error.js';
import { normalizeMediaUrl } from '../utils/media.js';
import { createMediaFromUpload, removeMediaFiles, absoluteUploadPath } from '../services/media.service.js';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
]);

const EXTENSION_MIME_MAP = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['video/mp4', '.mp4'],
  ['video/webm', '.webm'],
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

const resolveExtension = (file) => {
  const extension = path.extname(file.originalname || '');
  if (extension) return extension;
  return EXTENSION_MIME_MAP.get(file.mimetype) || '.bin';
};

const resolveApiBaseUrl = (req) => {
  const configured = process.env.API_PUBLIC_URL?.replace(/\/$/, '');
  if (configured) return configured;
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto ? forwardedProto.split(',')[0] : req.protocol;
  return `${protocol}://${req.get('host')}`;
};

const isAbsoluteUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:');
};

const resolveAbsoluteUrl = (req, value) => {
  if (!value) return value;
  if (isAbsoluteUrl(value)) return value;
  const baseUrl = resolveApiBaseUrl(req);
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${baseUrl}${normalized}`;
};

const resolvePreviewType = (media) => {
  if (!media) return 'file';
  if (media.type) return media.type;
  if (media.kind) return media.kind;
  if (media.mimeType?.startsWith('video/')) return 'video';
  if (media.mimeType?.startsWith('image/')) return 'image';
  return 'file';
};

const logUpload = (context) => {
  if (process.env.NODE_ENV === 'production') return;
  console.info('[MEDIA_UPLOAD]', context);
};

const serializeMedia = (media, req) => {
  if (!media) return media;
  const payload = media.toObject ? media.toObject() : { ...media };
  const applyUrl = (value) => resolveAbsoluteUrl(req, value);
  const variants = payload.variants
    ? Object.fromEntries(
        Object.entries(payload.variants).map(([key, variant]) => [
          key,
          variant ? { ...variant, url: applyUrl(variant.url) } : variant,
        ])
      )
    : payload.variants;

  return {
    ...payload,
    url: applyUrl(payload.url),
    originalUrl: applyUrl(payload.originalUrl),
    thumbUrl: applyUrl(payload.thumbUrl),
    coverUrl: applyUrl(payload.coverUrl),
    mediumUrl: applyUrl(payload.mediumUrl),
    original: payload.original ? { ...payload.original, url: applyUrl(payload.original.url) } : payload.original,
    variants,
    previewType: resolvePreviewType(payload),
  };
};

const resolveMediaOwnerId = (media) => {
  if (!media) return null;
  const owner = media.uploadedBy || media.createdBy;
  if (!owner) return null;
  if (typeof owner === 'string') return owner;
  return owner._id?.toString?.() || owner.id?.toString?.() || null;
};

const isOwnerOrAdmin = (media, user) => {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  const ownerId = resolveMediaOwnerId(media);
  return ownerId ? ownerId === user.id : false;
};

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, absoluteUploadPath);
  },
  filename: (req, file, cb) => {
    const mediaId = req.mediaId?.toString?.() || req.mediaId;
    const safeId = mediaId || Date.now().toString();
    const extension = resolveExtension(file);
    cb(null, `${safeId}-original${extension}`);
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

export const uploadMediaMiddleware = (req, res, next) => {
  req.mediaId = req.mediaId || new Media()._id;
  upload.single('file')(req, res, (err) => {
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
    return next();
  });
};

export const uploadMedia = async (req, res, next) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  if (uploadedFile.mimetype.startsWith('image/') && uploadedFile.size > MAX_IMAGE_SIZE) {
    try {
      await fs.promises.unlink(uploadedFile.path);
    } catch (error) {
      // ignore cleanup errors
    }
    return res.status(400).json({ success: false, message: 'Image too large (max 10MB)' });
  }

  try {
    logUpload({
      userId: req.user?.id || req.user?._id,
      mime: uploadedFile.mimetype,
      size: uploadedFile.size,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalname,
    });
    const payload = {
      title: req.body?.title,
      name: req.body?.name,
      alt: req.body?.alt,
      altText: req.body?.altText,
      caption: req.body?.caption,
      credit: req.body?.credit,
      category: req.body?.category,
      subCategory: req.body?.subCategory,
      tags: parseTags(req.body?.tags),
      status: req.body?.status,
      mediaId: req.mediaId,
    };
    const media = await createMediaFromUpload(uploadedFile, req.user, payload);
    const serialized = serializeMedia(media, req);
    const absoluteUrl =
      serialized?.url || serialized?.original?.url || serialized?.originalUrl || serialized?.thumbUrl || null;
    const filename = absoluteUrl ? absoluteUrl.split('/').pop() : null;
    const summary = {
      id: serialized?._id,
      url: absoluteUrl,
      name: serialized?.name || serialized?.title || uploadedFile.originalname,
      type: serialized?.type || serialized?.kind,
      mimeType: serialized?.mimeType,
      variants: serialized?.variants,
      createdAt: serialized?.createdAt,
    };

    return res.status(201).json({
      success: true,
      data: {
        media: summary,
        id: serialized?._id,
        url: absoluteUrl,
        filename,
        mimeType: serialized?.mimeType,
        size: serialized?.size,
        width: serialized?.width,
        height: serialized?.height,
        createdAt: serialized?.createdAt,
      },
      media: serialized,
    });
  } catch (error) {
    return next(error);
  }
};

export const createMedia = async (req, res, next) => {
  try {
    const { title, alt, category } = req.body;
    if (!category) {
      return next(errorHandler(400, 'Missing required fields'));
    }

    const payload = {
      title,
      alt,
      caption: req.body.caption,
      credit: req.body.credit,
      category,
      tags: parseTags(req.body.tags),
      status: req.body.status || 'draft',
      createdBy: req.user?.id || req.user?._id,
      name: req.body.name || title,
      subCategory: req.body.subCategory,
      url: req.body.url ? normalizeMediaUrl(req.body.url) : undefined,
      kind: req.body.kind,
      mimeType: req.body.mimeType,
      size: req.body.size,
      altText: req.body.altText,
      uploadedBy: req.user?.id || req.user?._id,
    };

    const media = await Media.create(payload);
    const serialized = serializeMedia(media, req);
    res.status(201).json({ success: true, media: serialized, data: { media: serialized } });
  } catch (error) {
    next(error);
  }
};

export const requireMediaOwnerOrAdmin = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return next(errorHandler(404, 'Media not found'));
    }
    if (!isOwnerOrAdmin(media, req.user)) {
      return res.status(403).json({ success: false, message: 'Forbidden: owner or admin required' });
    }
    req.media = media;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const listMedia = async (req, res, next) => {
  try {
    const {
      search,
      category,
      subCategory,
      type,
      status,
      page = 1,
      startIndex,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { alt: regex }, { tags: regex }, { category: regex }];
    }

    const sortDirection = order === 'asc' ? 1 : -1;
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const fallbackPage =
      startIndex !== undefined ? Math.floor((parseInt(startIndex) || 0) / safeLimit) + 1 : parseInt(page);
    const currentPage = fallbackPage || 1;
    const skip = (currentPage - 1) * safeLimit;
    const media = await Media.find(query)
      .sort({ [sort]: sortDirection })
      .skip(skip)
      .limit(safeLimit);

    const totalMedia = await Media.countDocuments(query);
    const totalPages = Math.ceil(totalMedia / safeLimit) || 1;
    const serializedMedia = media.map((item) => serializeMedia(item, req));
    const startOffset = skip;

    res.status(200).json({
      success: true,
      items: serializedMedia,
      total: totalMedia,
      startIndex: startOffset,
      limit: safeLimit,
      media: serializedMedia,
      totalMedia,
      page: currentPage,
      totalPages,
      data: {
        items: serializedMedia,
        total: totalMedia,
        startIndex: startOffset,
        limit: safeLimit,
        media: serializedMedia,
        totalMedia,
        page: currentPage,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return next(errorHandler(404, 'Media not found'));
    }
    const serialized = serializeMedia(media, req);
    res.status(200).json({ success: true, media: serialized, data: { media: serialized } });
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const media = req.media || (await Media.findById(req.params.id));
    if (!media) {
      return next(errorHandler(404, 'Media not found'));
    }

    await removeMediaFiles(media);
    await media.deleteOne();
    res.status(200).json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateMedia = async (req, res, next) => {
  try {
    const media = req.media || (await Media.findById(req.params.id));
    if (!media) {
      return next(errorHandler(404, 'Media not found'));
    }

    const updates = {
      title: req.body.title,
      alt: req.body.alt,
      caption: req.body.caption,
      credit: req.body.credit,
      category: req.body.category,
      subCategory: req.body.subCategory,
      tags: req.body.tags ? parseTags(req.body.tags) : undefined,
      status: req.body.status,
    };

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    if (updates.title !== undefined) {
      updates.name = updates.title;
    }
    if (updates.alt !== undefined) {
      updates.altText = updates.alt;
    }

    const updated = await Media.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    const serialized = serializeMedia(updated, req);
    res.status(200).json({ success: true, media: serialized, data: { media: serialized } });
  } catch (error) {
    next(error);
  }
};
