import slugify from 'slugify';
import Page from '../models/page.model.js';
import { errorHandler } from '../utils/error.js';
import { normalizeMediaUrl } from '../utils/media.js';

const STATUS_OPTIONS = new Set(['draft', 'published', 'scheduled']);
const VISIBILITY_OPTIONS = new Set(['public', 'private']);
const TEMPLATE_OPTIONS = new Set(['default', 'landing', 'article']);

const resolveStatusAndSchedule = (status, publishedAt) => {
  const nextStatus = STATUS_OPTIONS.has(status) ? status : 'draft';
  const parsedDate = publishedAt ? new Date(publishedAt) : undefined;
  if (nextStatus === 'published') {
    return { status: 'published', publishedAt: parsedDate || new Date() };
  }
  if (nextStatus === 'scheduled') {
    return { status: 'scheduled', publishedAt: parsedDate || new Date() };
  }
  return { status: nextStatus, publishedAt: parsedDate };
};

const removeUndefined = (payload) => {
  const cleaned = { ...payload };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

export const createPage = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return next(errorHandler(400, 'Title and content are required'));
    }

    const rawSlug = req.body.slug ? String(req.body.slug) : title;
    const slug = slugify(rawSlug, { lower: true, strict: true });
    const { status, publishedAt } = resolveStatusAndSchedule(req.body.status, req.body.publishedAt);
    const visibility = VISIBILITY_OPTIONS.has(req.body.visibility) ? req.body.visibility : 'public';
    const template = TEMPLATE_OPTIONS.has(req.body.template) ? req.body.template : 'default';
    const featuredMediaUrl = normalizeMediaUrl(req.body.featuredMediaUrl);
    const ogImage = normalizeMediaUrl(req.body.ogImage);

    const newPage = new Page({
      userId: req.user.id,
      title,
      slug,
      content,
      excerpt: req.body.excerpt,
      status,
      publishedAt,
      featuredMediaId: req.body.featuredMediaId || undefined,
      featuredMediaUrl,
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      ogImage,
      visibility,
      template,
    });

    await newPage.save();

    res.status(201).json({
      success: true,
      data: { page: newPage },
    });
  } catch (error) {
    next(error);
  }
};

export const getPages = async (req, res, next) => {
  try {
    const { searchTerm, status, visibility, startIndex, limit, order, sortBy } = req.query;
    const filters = {};
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isAdmin && req.user?.id) {
      filters.userId = req.user.id;
    }

    if (status) {
      const statuses = status
        .split(',')
        .map((value) => value.trim())
        .filter((value) => STATUS_OPTIONS.has(value));
      if (statuses.length) {
        filters.status = { $in: statuses };
      }
    }

    if (visibility && VISIBILITY_OPTIONS.has(visibility)) {
      filters.visibility = visibility;
    }

    if (searchTerm) {
      filters.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { slug: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const sortField = sortBy || 'updatedAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = Number(startIndex) || 0;
    const pageLimit = Number(limit) || 20;

    const [pages, totalPages] = await Promise.all([
      Page.find(filters)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(pageLimit)
        .populate('featuredMediaId'),
      Page.countDocuments(filters),
    ]);

    res.status(200).json({
      success: true,
      data: {
        pages,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPage = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.pageId).populate('featuredMediaId');
    if (!page) {
      return next(errorHandler(404, 'Page not found'));
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = req.user?.id && page.userId?.toString() === req.user.id;
    if (page.status !== 'published' && !isAdmin && !isOwner) {
      return next(errorHandler(403, 'You are not allowed to view this page'));
    }

    res.status(200).json({
      success: true,
      data: { page },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePage = async (req, res, next) => {
  try {
    const pageId = req.params.pageId;
    const existingPage = await Page.findById(pageId);
    if (!existingPage) {
      return next(errorHandler(404, 'Page not found'));
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = req.user?.id && existingPage.userId?.toString() === req.user.id;
    if (!isAdmin && !isOwner) {
      return next(errorHandler(403, 'You are not allowed to update this page'));
    }

    const nextSlug = req.body.slug ? slugify(req.body.slug, { lower: true, strict: true }) : undefined;
    const { status, publishedAt } = resolveStatusAndSchedule(
      req.body.status || existingPage.status,
      req.body.publishedAt || existingPage.publishedAt
    );

    const updatePayload = removeUndefined({
      title: req.body.title,
      slug: nextSlug,
      content: req.body.content,
      excerpt: req.body.excerpt,
      status,
      publishedAt,
      featuredMediaId: req.body.featuredMediaId,
      featuredMediaUrl: req.body.featuredMediaUrl ? normalizeMediaUrl(req.body.featuredMediaUrl) : undefined,
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      ogImage: req.body.ogImage ? normalizeMediaUrl(req.body.ogImage) : undefined,
      visibility: VISIBILITY_OPTIONS.has(req.body.visibility) ? req.body.visibility : undefined,
      template: TEMPLATE_OPTIONS.has(req.body.template) ? req.body.template : undefined,
    });

    const updatedPage = await Page.findByIdAndUpdate(pageId, { $set: updatePayload }, { new: true }).populate(
      'featuredMediaId'
    );

    res.status(200).json({
      success: true,
      data: { page: updatedPage },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePageStatus = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) {
      return next(errorHandler(404, 'Page not found'));
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = req.user?.id && page.userId?.toString() === req.user.id;
    if (!isAdmin && !isOwner) {
      return next(errorHandler(403, 'You are not allowed to update this page'));
    }

    const { status, publishedAt } = resolveStatusAndSchedule(req.body.status, req.body.publishedAt);

    page.status = status;
    page.publishedAt = publishedAt;
    await page.save();

    res.status(200).json({
      success: true,
      data: { page },
    });
  } catch (error) {
    next(error);
  }
};

export const deletePage = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) {
      return next(errorHandler(404, 'Page not found'));
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = req.user?.id && page.userId?.toString() === req.user.id;
    if (!isAdmin && !isOwner) {
      return next(errorHandler(403, 'You are not allowed to delete this page'));
    }

    await page.deleteOne();
    res.status(200).json({ success: true, data: { page } });
  } catch (error) {
    next(error);
  }
};
