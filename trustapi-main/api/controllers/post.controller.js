import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';


/*export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create a post'));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }
  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};
*/
import slugify from 'slugify';

export const create = async (req, res) => {
  try {
    console.log(req.body); // 🔍 Vérifie que subcategory est bien envoyé

    const { title, content, category, subCategory, eventDate, location, image } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const newPost = new Post({
      userId: req.user.id || req.user._id,
      title,
      slug,
      content,
      category,
      subCategory, // ✅ Vérifie que subcategory est bien ici
      image: image || "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png",
      ...(category === "TrustEvent" && { eventDate, location }),
    });

    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updatepost = async (req, res) => {
  try {
    if (!req.user.isAdmin && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "You are not allowed to update this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          subCategory: req.body.subCategory, // Ajout ici
          image: req.body.image || "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png",
        },
      },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



export const getposts = async (req, res, next) => {
  try {
    const { userId, category, subcategory, slug, postId, searchTerm, startIndex, limit, order } = req.query;

    const query = {
      ...(userId && { userId }),
      ...(category && { category }),
      ...(subcategory && { subcategory }), // Ajout du filtre par sous-catégorie
      ...(slug && { slug }),
      ...(postId && { _id: postId }),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { content: { $regex: searchTerm, $options: "i" } },
        ],
      }),
    };

    const posts = await Post.find(query)
      .sort({ updatedAt: order === "asc" ? 1 : -1 })
      .skip(parseInt(startIndex) || 0)
      .limit(parseInt(limit) || 9);

    const totalPosts = await Post.countDocuments(query);

    res.status(200).json({
      posts,
      totalPosts,
    });
  } catch (error) {
    next(error);
  }
};


export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};
