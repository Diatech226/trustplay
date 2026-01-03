import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

/** ✅ Create a Comment */
export const createComment = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(errorHandler(401, "Unauthorized"));
    }

    const { content, postId } = req.body;

    if (!postId || !content) {
      return res.status(400).json({ success: false, message: "postId and content are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: "Invalid postId" });
    }

    const postExists = await Post.findById(postId);
    if (!postExists) {
      return next(errorHandler(404, "Post not found"));
    }

    const newComment = new Comment({
      userId: req.user.id,
      postId,
      content,
    });

    await newComment.save();
    await newComment.populate('userId', 'username profilePicture');

    res.status(201).json({
      success: true,
      data: {
        comment: newComment,
      },
      comment: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    next(error);
  }
};

/** ✅ Get Comments for a Post */


export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId || postId === "undefined" || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: "Invalid postId" });
    }

    const comments = await Comment.find({ postId })
      .populate("userId", "username profilePicture") // 👈 Peuple le champ userId avec username et profilePicture
      .sort({ createdAt: -1 }); // Trie les commentaires du plus récent au plus ancien

    res.status(200).json({ success: true, data: { comments }, comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des commentaires." });
  }
};


/** ✅ Like or Unlike a Comment */
export const likeComment = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(errorHandler(401, "Unauthorized"));
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }

    const userIndex = comment.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      comment.likes.push(req.user.id);
      comment.numberOfLikes += 1;
    } else {
      comment.likes.splice(userIndex, 1);
      comment.numberOfLikes -= 1;
    }

    await comment.save();
    res.status(200).json({ success: true, data: comment, comment });
  } catch (error) {
    next(error);
  }
};

/** ✅ Edit a Comment */
export const editComment = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(errorHandler(401, "Unauthorized"));
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }

    if (comment.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(errorHandler(403, "You are not allowed to edit this comment"));
    }

    comment.content = req.body.content;
    await comment.save();

    res.status(200).json({ success: true, data: comment, comment });
  } catch (error) {
    next(error);
  }
};

/** ✅ Delete a Comment */
export const deleteComment = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(errorHandler(401, "Unauthorized"));
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }

    if (comment.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(errorHandler(403, "You are not allowed to delete this comment"));
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json({ success: true, message: "Comment has been deleted" });
  } catch (error) {
    next(error);
  }
};

/** ✅ Get All Comments (Admin Only) */
export const getComments = async (req, res, next) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return next(errorHandler(403, "You are not allowed to get all comments"));
    }

    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const sortDirection = req.query.sort === "desc" ? -1 : 1;

    const comments = await Comment.find()
      .populate("userId", "username profilePicture")
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalComments = await Comment.countDocuments();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const lastMonthComments = await Comment.countDocuments({ createdAt: { $gte: oneMonthAgo } });

    res.status(200).json({
      success: true,
      comments,
      totalComments,
      lastMonthComments,
      data: { comments, totalComments, lastMonthComments },
    });
  } catch (error) {
    next(error);
  }
};
