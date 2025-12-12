import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';
import slugify from 'slugify';

export const create = async (req, res, next) => {
  try {
    const { title, content, category, subCategory, eventDate, location, image } = req.body;
    if (!title || !content || !category) {
      return next(errorHandler(400, 'Missing required fields'));
    }

    const slug = slugify(title, { lower: true, strict: true });

    const newPost = new Post({
      userId: req.user.id || req.user._id,
      title,
      slug,
      content,
      category,
      subCategory,
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
    if (!req.user.isAdmin && req.user.id !== req.params.userId) {
      return next(errorHandler(403, 'You are not allowed to update this post'));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          subCategory: req.body.subCategory,
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

    const query = {
      ...(userId && { userId }),
      ...(category && { category }),
      ...(subCategory && { subCategory }),
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

    res.status(200).json({
      success: true,
      data: {
        posts,
        totalPosts,
      },
      posts,
      totalPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ success: true, message: 'The post has been deleted' });
  } catch (error) {
    next(error);
  }
};
