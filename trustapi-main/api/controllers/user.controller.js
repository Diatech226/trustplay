import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';
import { ensureUserRole, resolveUserRole } from '../utils/roles.js';

const sanitizeUser = (userDoc = {}) => {
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete userObj.password;
  delete userObj.passwordHash;
  userObj.role = resolveUserRole(userObj) || 'USER';
  return userObj;
};

export const test = (req, res) => {
  res.json({ success: true, message: 'API is working!' });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this user'));
  }
  const updates = {};
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, 'Password must be at least 6 characters'));
    }
    updates.passwordHash = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(errorHandler(400, 'Username must be between 7 and 20 characters'));
    }
    if (req.body.username.includes(' ')) {
      return next(errorHandler(400, 'Username cannot contain spaces'));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, 'Username must be lowercase'));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(errorHandler(400, 'Username can only contain letters and numbers'));
    }
    updates.username = req.body.username;
  }
  if (req.body.email) {
    updates.email = req.body.email.toLowerCase();
  }
  if (req.body.profilePicture) {
    updates.profilePicture = req.body.profilePicture;
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: updates,
      },
      { new: true }
    );
    const rest = sanitizeUser(updatedUser);
    res.status(200).json({ success: true, data: { user: rest }, user: rest });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user?.role !== 'ADMIN' && req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this user'));
  }
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return next(errorHandler(404, 'User not found'));
    }
    if (targetUser.role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1) {
        return next(errorHandler(400, 'Cannot delete the last admin'));
      }
    }
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json({ success: true, message: 'User has been deleted' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return next(errorHandler(401, 'Unauthorized'));
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(errorHandler(401, 'Unauthorized'));
    }
    await ensureUserRole(user);
    const rest = sanitizeUser(user);
    res.status(200).json({ success: true, data: { user: rest }, user: rest });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return next(errorHandler(403, 'You are not allowed to see all users'));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map(sanitizeUser);

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      success: true,
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
      data: { users: usersWithoutPassword, totalUsers, lastMonthUsers },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    const rest = sanitizeUser(user);
    res.status(200).json({ success: true, data: { user: rest }, user: rest });
  } catch (error) {
    next(error);
  }
};
