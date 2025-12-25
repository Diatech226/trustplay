import Media from '../models/media.model.js';
import { errorHandler } from '../utils/error.js';

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

const resolveKind = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'file';
};

export const createMedia = async (req, res, next) => {
  try {
    const { name, category, url, mimeType, size, kind, altText, tags } = req.body;
    if (!name || !category || !url) {
      return next(errorHandler(400, 'Missing required fields'));
    }

    const payload = {
      name,
      category,
      url,
      mimeType,
      size,
      kind: kind || resolveKind(mimeType),
      altText,
      tags: parseTags(tags),
      uploadedBy: req.user?.id || req.user?._id,
    };

    const media = await Media.create(payload);
    res.status(201).json({ success: true, media, data: { media } });
  } catch (error) {
    next(error);
  }
};

export const listMedia = async (req, res, next) => {
  try {
    const {
      search,
      category,
      kind,
      startIndex = 0,
      limit = 20,
      order = 'desc',
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (kind) query.kind = kind;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { category: regex }, { url: regex }, { tags: regex }];
    }

    const sortDirection = order === 'asc' ? 1 : -1;
    const media = await Media.find(query)
      .sort({ createdAt: sortDirection })
      .skip(parseInt(startIndex) || 0)
      .limit(parseInt(limit) || 20);

    const totalMedia = await Media.countDocuments(query);

    res.status(200).json({ success: true, media, totalMedia, data: { media, totalMedia } });
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return next(errorHandler(404, 'Media not found'));
    }

    const isOwner = media.uploadedBy?.toString() === req.user?.id;
    if (!req.user?.isAdmin && !isOwner) {
      return next(errorHandler(403, 'Forbidden'));
    }

    await media.deleteOne();
    res.status(200).json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return next(errorHandler(404, 'Media not found'));
    }

    const isOwner = media.uploadedBy?.toString() === req.user?.id;
    if (!req.user?.isAdmin && !isOwner) {
      return next(errorHandler(403, 'Forbidden'));
    }

    const updates = {
      name: req.body.name,
      category: req.body.category,
      altText: req.body.altText,
      tags: req.body.tags ? parseTags(req.body.tags) : undefined,
    };

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    const updated = await Media.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    res.status(200).json({ success: true, media: updated, data: { media: updated } });
  } catch (error) {
    next(error);
  }
};
