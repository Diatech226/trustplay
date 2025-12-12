import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';
import slugify from 'slugify';

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

export const create = async (req, res, next) => {
  try {
    const { title, content, category, subCategory, eventDate, location, image } = req.body;
    if (!title || !content || !category) {
      return next(errorHandler(400, 'Missing required fields'));
    }

    const slug = slugify(title, { lower: true, strict: true });
    const normalizedSubCategory = normalizeSubCategory(subCategory);

    const newPost = new Post({
      userId: req.user.id || req.user._id,
      title,
      slug,
      content,
      category,
      subCategory: normalizedSubCategory,
      image:
        image || 'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png',
      ...(category === 'TrustEvent' && { eventDate, location }),
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
    if (!req.user?.isAdmin) {
      let ownerId = targetUserId;
      if (!ownerId && postId) {
        const existing = await Post.findById(postId).select('userId');
        ownerId = existing?.userId?.toString();
      }
      if (ownerId && ownerId !== req.user.id) {
        return next(errorHandler(403, 'You are not allowed to update this post'));
      }
    }

    const normalizedSubCategory = normalizeSubCategory(req.body.subCategory);

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          subCategory: normalizedSubCategory,
          image:
            req.body.image ||
            'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png',
        },
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
    const { userId, category, subCategory, slug, postId, searchTerm, startIndex, limit, order } = req.query;

    const normalizedSubCategory = normalizeSubCategory(subCategory);

    const query = {
      ...(userId && { userId }),
      ...(category && { category }),
      ...(normalizedSubCategory && { subCategory: normalizedSubCategory }),
      ...(slug && { slug }),
      ...(postId && { _id: postId }),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
        ],
      }),
    };

    const posts = await Post.find(query)
      .sort({ updatedAt: order === 'asc' ? 1 : -1 })
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
    if (!req.user?.isAdmin) {
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
