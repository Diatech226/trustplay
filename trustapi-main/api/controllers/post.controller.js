import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';
import slugify from 'slugify';
import { normalizeMediaUrl } from '../utils/media.js';

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

const DEFAULT_IMAGE_PLACEHOLDER =
  'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png';

const normalizeImageFields = (payload = {}) => ({
  imageOriginal: normalizeMediaUrl(payload.imageOriginal),
  imageThumb: normalizeMediaUrl(payload.imageThumb),
  imageCover: normalizeMediaUrl(payload.imageCover),
  imageMedium: normalizeMediaUrl(payload.imageMedium),
  imageThumbAvif: normalizeMediaUrl(payload.imageThumbAvif),
  imageCoverAvif: normalizeMediaUrl(payload.imageCoverAvif),
  imageMediumAvif: normalizeMediaUrl(payload.imageMediumAvif),
});

const ensureImageVariants = (post) => {
  if (!post) return post;
  const baseImage = post.image || post.imageOriginal || DEFAULT_IMAGE_PLACEHOLDER;
  return {
    ...post,
    image: post.image || baseImage,
    imageOriginal: post.imageOriginal || baseImage,
    imageThumb: post.imageThumb || baseImage,
    imageCover: post.imageCover || baseImage,
    imageMedium: post.imageMedium || baseImage,
  };
};

const attachFeaturedMedia = (post) => {
  if (!post) return post;
  const featuredMedia = post.featuredMedia || post.featuredMediaId || null;
  return {
    ...post,
    featuredMedia: featuredMedia && featuredMedia._id ? featuredMedia : null,
    imageLegacy: post.image,
  };
};

const buildImageUpdatePayload = (payload = {}) => {
  const imageKeys = [
    'image',
    'imageOriginal',
    'imageThumb',
    'imageCover',
    'imageMedium',
    'imageThumbAvif',
    'imageCoverAvif',
    'imageMediumAvif',
  ];
  const hasImageInput = imageKeys.some((key) => payload[key] !== undefined);
  if (!hasImageInput) return {};

  const normalizedImage = normalizeMediaUrl(payload.image);
  const variants = normalizeImageFields(payload);
  const fallbackImage =
    normalizedImage ||
    variants.imageOriginal ||
    variants.imageCover ||
    variants.imageThumb ||
    variants.imageMedium ||
    DEFAULT_IMAGE_PLACEHOLDER;
  const shouldBackfill = payload.image !== undefined || payload.imageOriginal !== undefined;

  const imagePayload = {};
  if (payload.image !== undefined) {
    imagePayload.image = normalizedImage || fallbackImage;
  }
  if (payload.imageOriginal !== undefined || shouldBackfill) {
    imagePayload.imageOriginal = variants.imageOriginal || normalizedImage || fallbackImage;
  }
  if (payload.imageThumb !== undefined || shouldBackfill) {
    imagePayload.imageThumb = variants.imageThumb || normalizedImage || fallbackImage;
  }
  if (payload.imageCover !== undefined || shouldBackfill) {
    imagePayload.imageCover = variants.imageCover || normalizedImage || fallbackImage;
  }
  if (payload.imageMedium !== undefined || shouldBackfill) {
    imagePayload.imageMedium = variants.imageMedium || normalizedImage || fallbackImage;
  }
  if (payload.imageThumbAvif !== undefined) {
    imagePayload.imageThumbAvif = variants.imageThumbAvif;
  }
  if (payload.imageCoverAvif !== undefined) {
    imagePayload.imageCoverAvif = variants.imageCoverAvif;
  }
  if (payload.imageMediumAvif !== undefined) {
    imagePayload.imageMediumAvif = variants.imageMediumAvif;
  }

  return imagePayload;
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

const STATUS_OPTIONS = new Set(['draft', 'published', 'archived']);

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
      featuredMediaId,
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

    const normalizedImage = normalizeMediaUrl(image);
    const normalizedVariants = normalizeImageFields(req.body);
    const baseImage =
      normalizedImage ||
      normalizedVariants.imageOriginal ||
      normalizedVariants.imageCover ||
      normalizedVariants.imageThumb ||
      normalizedVariants.imageMedium ||
      DEFAULT_IMAGE_PLACEHOLDER;
    const normalizedOgImage = normalizeMediaUrl(req.body.ogImage);

    const newPost = new Post({
      userId: req.user.id || req.user._id,
      title,
      slug,
      content,
      category,
      subCategory: category === 'TrustMedia' ? normalizedSubCategory : undefined,
      image: normalizedImage || baseImage,
      imageOriginal: normalizedVariants.imageOriginal || normalizedImage || baseImage,
      imageThumb: normalizedVariants.imageThumb || normalizedImage || baseImage,
      imageCover: normalizedVariants.imageCover || normalizedImage || baseImage,
      imageMedium: normalizedVariants.imageMedium || normalizedImage || baseImage,
      imageThumbAvif: normalizedVariants.imageThumbAvif,
      imageCoverAvif: normalizedVariants.imageCoverAvif,
      imageMediumAvif: normalizedVariants.imageMediumAvif,
      status: finalStatus,
      publishedAt: finalPublishedAt,
      tags: tagList,
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      ogImage: normalizedOgImage,
      featured: Boolean(req.body.featured),
      ...(category === 'TrustEvent' && {
        eventDate,
        location,
        pricingType: normalizedPricing,
        price: normalizedPricing === 'paid' ? parsedPrice : undefined,
      }),
      coverMediaId,
      mediaIds: parseMediaIds(mediaIds),
      featuredMediaId,
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
    if (req.user?.isAdmin !== true) {
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

    const normalizedOgImage = normalizeMediaUrl(req.body.ogImage);
    const imagePayload = buildImageUpdatePayload(req.body);

    const updatePayload = removeUndefined({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      subCategory: nextCategory === 'TrustMedia' ? normalizedSubCategory : undefined,
      status: finalStatus,
      publishedAt: finalPublishedAt,
      tags: tagList,
      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      ogImage: req.body.ogImage === undefined ? undefined : normalizedOgImage,
      featured: req.body.featured !== undefined ? Boolean(req.body.featured) : undefined,
      eventDate: req.body.eventDate,
      location: req.body.location,
      pricingType: nextCategory === 'TrustEvent' ? normalizedPricing : undefined,
      price: nextCategory === 'TrustEvent' && normalizedPricing === 'paid' ? parsedPrice : undefined,
      coverMediaId: req.body.coverMediaId,
      mediaIds: req.body.mediaIds ? parseMediaIds(req.body.mediaIds) : undefined,
      featuredMediaId: req.body.featuredMediaId,
      ...imagePayload,
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

export const getpost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const shouldPopulateMedia = req.query.populateMedia === '1' || req.query.populateMedia === 'true';
    const query = Post.findById(postId);
    const post = shouldPopulateMedia ? await query.populate('featuredMediaId') : await query;
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    const isAdmin = req.user?.isAdmin === true;
    const isOwner = req.user?.id && post.userId?.toString() === req.user.id;
    if (post.status !== 'published' && !isAdmin && !isOwner) {
      return next(errorHandler(403, 'You are not allowed to view this post'));
    }

    const resolvedPost = attachFeaturedMedia(ensureImageVariants(post.toObject()));

    res.status(200).json({
      success: true,
      data: { post: resolvedPost },
      post: resolvedPost,
    });
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

    const isAdmin = req.user?.isAdmin === true;
    const allowAllStatuses = isAdmin || Boolean(userId);
    const defaultStatusFilter =
      !allowAllStatuses && statusList.length === 0 ? { status: { $in: ['published'] } } : {};
    const statusFilter = statusList.length ? { status: { $in: statusList } } : defaultStatusFilter;

    const query = {
      ...(userId && { userId }),
      ...(category && { category }),
      ...(normalizedSubCategory && { subCategory: normalizedSubCategory }),
      ...(slug && { slug }),
      ...(postId && { _id: postId }),
      ...statusFilter,
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
      (!hasStatusFilter && !userId && !isAdmin);
    const sortField = sortBy || (usesPublishedAt ? 'publishedAt' : 'updatedAt');
    const shouldPopulateMedia = req.query.populateMedia === '1' || req.query.populateMedia === 'true';
    const baseQuery = Post.find(query)
      .sort({ [sortField]: order === 'asc' ? 1 : -1 })
      .skip(parseInt(startIndex) || 0)
      .limit(parseInt(limit) || 9);
    const posts = shouldPopulateMedia ? await baseQuery.populate('featuredMediaId') : await baseQuery;

    const totalPosts = await Post.countDocuments(query);

    const normalizedPosts = posts.map((post) => {
      const resolvedPost = post.toObject ? post.toObject() : post;
      return attachFeaturedMedia(
        ensureImageVariants({
        ...resolvedPost,
        subCategory: normalizeSubCategory(resolvedPost.subCategory),
      })
      );
    });

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

export const updatePostStatus = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const status = typeof req.body?.status === 'string' ? req.body.status.trim().toLowerCase() : '';

    if (!STATUS_OPTIONS.has(status)) {
      return next(errorHandler(400, 'Invalid status value'));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    if (req.user?.isAdmin !== true && post.userId?.toString() !== req.user?.id) {
      return next(errorHandler(403, 'You are not allowed to update this post'));
    }

    post.status = status;
    if (status === 'published' && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Post status updated successfully',
      data: { post },
      post,
    });
  } catch (error) {
    return next(error);
  }
};

export const deletepost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const targetUserId = req.params.userId;
    if (req.user?.isAdmin !== true) {
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
