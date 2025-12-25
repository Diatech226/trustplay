import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';
import slugify from 'slugify';

const allowedCategories = new Set(['TrustMedia', 'TrustEvent', 'TrustProduction', 'TrustProd']);
const trustMediaSubCategories = new Set(['news', 'politique', 'science-tech', 'sport', 'cinema']);

const normalizeSubCategory = (value = '') => {
  const normalized = value.toString().trim().toLowerCase();
  const map = {
    news: 'news',
    actualites: 'news',
    'actualités': 'news',
    politique: 'politique',
    politics: 'politique',
    sport: 'sport',
    sports: 'sport',
    cinema: 'cinema',
    'cinéma': 'cinema',
    movie: 'cinema',
    film: 'cinema',
    economie: 'economie',
    'économie': 'economie',
    economy: 'economie',
    culture: 'culture',
    portraits: 'portraits',
  };

  if (map[normalized]) return map[normalized];
  const scienceKeys = ['science', 'science-tech', 'science/tech', 'sciencetech', 'technologie', 'technology', 'tech'];
  if (scienceKeys.includes(normalized)) return 'science-tech';
  return normalized || undefined;
};

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

const resolveStatusAndSchedule = (status, publishedAt) => {
  const nextStatus = status || 'draft';
  const parsedDate = publishedAt ? new Date(publishedAt) : undefined;
  if (nextStatus === 'published') {
    return { status: 'published', publishedAt: parsedDate || new Date() };
  }
  if (nextStatus === 'scheduled') {
    return { status: 'scheduled', publishedAt: parsedDate || new Date() };
  }
  return { status: nextStatus, publishedAt: parsedDate };
};

const normalizePricingType = (value) => {
  if (!value) return undefined;
  const normalized = value.toString().trim().toLowerCase();
  if (normalized === 'free' || normalized === 'paid') return normalized;
  return undefined;
};

const parseMediaIds = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }
  return [];
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

export const create = async (req, res, next) => {
  try {
    const {
      title,
      content,
      category,
      subCategory,
      eventDate,
      location,
      pricingType,
      price,
      image,
      status,
      publishedAt,
      tags,
      coverMediaId,
      mediaIds,
    } = req.body;
    if (!title || !content || !category) {
      return next(errorHandler(400, 'Missing required fields'));
    }

    if (!allowedCategories.has(category)) {
      return next(errorHandler(400, 'Invalid category'));
    }

    const slug = slugify(title, { lower: true, strict: true });
    const normalizedSubCategory = normalizeSubCategory(subCategory);
    if (category === 'TrustMedia') {
      if (!normalizedSubCategory) {
        return next(errorHandler(400, 'Sub-category is required for TrustMedia'));
      }
      if (!trustMediaSubCategories.has(normalizedSubCategory)) {
        return next(errorHandler(400, 'Invalid sub-category for TrustMedia'));
      }
    }
    const tagList = parseTags(tags);
    const { status: finalStatus, publishedAt: finalPublishedAt } = resolveStatusAndSchedule(status, publishedAt);
    const normalizedPricing = normalizePricingType(pricingType);
    const parsedPrice = price !== undefined && price !== '' ? Number(price) : undefined;

    if (category === 'TrustEvent') {
      if (!eventDate) {
        return next(errorHandler(400, 'Event date is required for TrustEvent'));
      }
      if (!location) {
        return next(errorHandler(400, 'Location is required for TrustEvent'));
      }
      if (!normalizedPricing) {
        return next(errorHandler(400, 'Pricing type is required for TrustEvent'));
      }
      if (normalizedPricing === 'paid' && (parsedPrice === undefined || Number.isNaN(parsedPrice))) {
        return next(errorHandler(400, 'Price is required for paid events'));
      }
    }

    const newPost = new Post({
      userId: req.user.id || req.user._id,
      title,
      slug,
      content,
      category,
      subCategory: category === 'TrustMedia' ? normalizedSubCategory : undefined,
      image:
        image || 'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png',
      status: finalStatus,
      publishedAt: finalPublishedAt,
      tags: tagList,
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      ogImage: req.body.ogImage,
      featured: Boolean(req.body.featured),
      ...(category === 'TrustEvent' && {
        eventDate,
        location,
        pricingType: normalizedPricing,
        price: normalizedPricing === 'paid' ? parsedPrice : undefined,
      }),
      coverMediaId,
      mediaIds: parseMediaIds(mediaIds),
    });

    await newPost.save();
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: newPost },
      post: newPost,
      slug: newPost.slug,
    });
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const targetUserId = req.params.userId;
    let existingPost;
    if (req.user?.role !== 'ADMIN') {
      let ownerId = targetUserId;
      if (!ownerId && postId) {
        existingPost = await Post.findById(postId).select(
          'userId category subCategory eventDate location pricingType price'
        );
        ownerId = existingPost?.userId?.toString();
      }
      if (ownerId && ownerId !== req.user.id) {
        return next(errorHandler(403, 'You are not allowed to update this post'));
      }
    }

    if (!existingPost) {
      existingPost = await Post.findById(postId).select('category subCategory eventDate location pricingType price');
    }
    if (!existingPost) {
      return next(errorHandler(404, 'Post not found'));
    }

    const nextCategory = req.body.category || existingPost?.category;
    if (nextCategory && !allowedCategories.has(nextCategory)) {
      return next(errorHandler(400, 'Invalid category'));
    }

    const normalizedSubCategory = normalizeSubCategory(req.body.subCategory || existingPost?.subCategory);
    if (nextCategory === 'TrustMedia') {
      if (!normalizedSubCategory) {
        return next(errorHandler(400, 'Sub-category is required for TrustMedia'));
      }
      if (!trustMediaSubCategories.has(normalizedSubCategory)) {
        return next(errorHandler(400, 'Invalid sub-category for TrustMedia'));
      }
    }

    const tagList = parseTags(req.body.tags);
    const { status: finalStatus, publishedAt: finalPublishedAt } = resolveStatusAndSchedule(
      req.body.status,
      req.body.publishedAt
    );
    const normalizedPricing = normalizePricingType(req.body.pricingType || existingPost?.pricingType);
    const parsedPrice =
      req.body.price !== undefined && req.body.price !== '' ? Number(req.body.price) : existingPost?.price;

    if (nextCategory === 'TrustEvent') {
      const nextEventDate = req.body.eventDate || existingPost?.eventDate;
      const nextLocation = req.body.location || existingPost?.location;
      if (!nextEventDate) {
        return next(errorHandler(400, 'Event date is required for TrustEvent'));
      }
      if (!nextLocation) {
        return next(errorHandler(400, 'Location is required for TrustEvent'));
      }
      if (!normalizedPricing) {
        return next(errorHandler(400, 'Pricing type is required for TrustEvent'));
      }
      if (normalizedPricing === 'paid' && (parsedPrice === undefined || Number.isNaN(parsedPrice))) {
        return next(errorHandler(400, 'Price is required for paid events'));
      }
    }

    const updatePayload = removeUndefined({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      subCategory: nextCategory === 'TrustMedia' ? normalizedSubCategory : undefined,
      image:
        req.body.image ||
        'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png',
      status: finalStatus,
      publishedAt: finalPublishedAt,
      tags: tagList,
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      ogImage: req.body.ogImage,
      featured: req.body.featured !== undefined ? Boolean(req.body.featured) : undefined,
      eventDate: req.body.eventDate,
      location: req.body.location,
      pricingType: nextCategory === 'TrustEvent' ? normalizedPricing : undefined,
      price: nextCategory === 'TrustEvent' && normalizedPricing === 'paid' ? parsedPrice : undefined,
      coverMediaId: req.body.coverMediaId,
      mediaIds: req.body.mediaIds ? parseMediaIds(req.body.mediaIds) : undefined,
    });

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: updatePayload,
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedPost, post: updatedPost, slug: updatedPost.slug });
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const {
      userId,
      category,
      subCategory,
      slug,
      postId,
      searchTerm,
      startIndex,
      limit,
      order,
      status,
      tags,
      publishedFrom,
      publishedTo,
      sortBy,
    } = req.query;

    const normalizedSubCategory = normalizeSubCategory(subCategory);
    const requestedTags = parseTags(tags);
    const statusList = status ? status.split(',').map((value) => value.trim()).filter(Boolean) : [];

    const query = {
      ...(userId && { userId }),
      ...(category && { category }),
      ...(normalizedSubCategory && { subCategory: normalizedSubCategory }),
      ...(slug && { slug }),
      ...(postId && { _id: postId }),
      ...(statusList.length
        ? { status: { $in: statusList } }
        : !userId && { status: { $in: ['published'] } }),
      ...(requestedTags.length ? { tags: { $all: requestedTags } } : {}),
      ...(publishedFrom || publishedTo
        ? {
            publishedAt: {
              ...(publishedFrom && { $gte: new Date(publishedFrom) }),
              ...(publishedTo && { $lte: new Date(publishedTo) }),
            },
          }
        : {}),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
          { tags: { $regex: searchTerm, $options: 'i' } },
        ],
      }),
    };

    const hasStatusFilter = statusList.length > 0;
    const usesPublishedAt =
      (hasStatusFilter && statusList.every((value) => ['published', 'scheduled'].includes(value))) ||
      (!hasStatusFilter && !userId);
    const sortField = sortBy || (usesPublishedAt ? 'publishedAt' : 'updatedAt');
    const posts = await Post.find(query)
      .sort({ [sortField]: order === 'asc' ? 1 : -1 })
      .skip(parseInt(startIndex) || 0)
      .limit(parseInt(limit) || 9);

    const totalPosts = await Post.countDocuments(query);

    const normalizedPosts = posts.map((post) => ({
      ...(post.toObject ? post.toObject() : post),
      subCategory: normalizeSubCategory(post.subCategory),
    }));

    res.status(200).json({
      success: true,
      data: {
        posts: normalizedPosts,
        totalPosts,
      },
      posts: normalizedPosts,
      totalPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const targetUserId = req.params.userId;
    if (req.user?.role !== 'ADMIN') {
      let ownerId = targetUserId;
      if (!ownerId && postId) {
        const existing = await Post.findById(postId).select('userId');
        ownerId = existing?.userId?.toString();
      }
      if (ownerId && ownerId !== req.user.id) {
        return next(errorHandler(403, 'You are not allowed to delete this post'));
      }
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ success: true, message: 'The post has been deleted' });
  } catch (error) {
    next(error);
  }
};
