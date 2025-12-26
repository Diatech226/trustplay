import bcryptjs from 'bcryptjs';
import User, { USER_ROLES } from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import { resolveUserRole } from '../utils/roles.js';

const sanitizeUser = (userDoc = {}) => {
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete userObj.password;
  delete userObj.passwordHash;
  delete userObj.passwordResetTokenHash;
  delete userObj.passwordResetExpiresAt;
  const resolvedRole = resolveUserRole(userObj) || 'USER';
  userObj.role = resolvedRole;
  userObj.isAdmin = resolvedRole === 'ADMIN';
  return userObj;
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const normalizeRole = (value, { allowDefault = false } = {}) => {
  if (value === undefined || value === null || value === '') {
    return allowDefault ? 'USER' : null;
  }
  const role = String(value).toUpperCase();
  return USER_ROLES.includes(role) ? role : null;
};

const resolveRoleInput = (roleValue, isAdminValue, options = {}) => {
  const normalizedRole = normalizeRole(roleValue, options);
  if (normalizedRole) return normalizedRole;
  if (typeof isAdminValue === 'boolean') {
    return isAdminValue ? 'ADMIN' : 'USER';
  }
  return options.allowDefault ? 'USER' : null;
};

const ensureNotLastAdmin = async (user) => {
  if (user?.role !== 'ADMIN') return;
  const adminCount = await User.countDocuments({ role: 'ADMIN' });
  if (adminCount <= 1) {
    throw errorHandler(400, 'Cannot remove the last admin');
  }
};

export const createAdminUser = async (req, res, next) => {
  const username = normalizeString(req.body?.username);
  const email = normalizeString(req.body?.email).toLowerCase();
  const password = normalizeString(req.body?.password);
  const role = resolveRoleInput(req.body?.role, req.body?.isAdmin, { allowDefault: true });

  if (!username || !email || !password) {
    return next(errorHandler(400, 'Username, email and password are required'));
  }
  if (!isValidEmail(email)) {
    return next(errorHandler(400, 'Invalid email format'));
  }
  if (!role) {
    return next(errorHandler(400, 'Invalid role provided'));
  }
  if (password.length < 8) {
    return next(errorHandler(400, 'Password must be at least 8 characters long'));
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return next(errorHandler(409, 'User with this email or username already exists'));
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      passwordHash,
      role,
      authProvider: 'local',
    });

    const sanitized = sanitizeUser(newUser);
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: sanitized },
    });
  } catch (error) {
    return next(error);
  }
};

export const listAdminUsers = async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const search = normalizeString(req.query.search);
  const role = normalizeRole(req.query.role);
  const sortDirection = req.query.sort === 'asc' ? 1 : -1;

  const filter = {};
  if (search) {
    filter.$or = [
      { username: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }
  if (req.query.role) {
    if (!role) {
      return next(errorHandler(400, 'Invalid role filter'));
    }
    filter.role = role;
  }

  try {
    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit);

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users: users.map(sanitizeUser),
        totalUsers,
        lastMonthUsers,
        page,
        limit,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAdminUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    return res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminUser = async (req, res, next) => {
  const updates = {};
  const username = normalizeString(req.body?.username);
  const email = normalizeString(req.body?.email).toLowerCase();
  const role = resolveRoleInput(req.body?.role, req.body?.isAdmin);
  const password = normalizeString(req.body?.password);
  const profilePicture = normalizeString(req.body?.profilePicture);

  if (req.body?.username !== undefined) {
    if (!username) {
      return next(errorHandler(400, 'Username cannot be empty'));
    }
    updates.username = username;
  }
  if (req.body?.email !== undefined) {
    if (!email || !isValidEmail(email)) {
      return next(errorHandler(400, 'Invalid email format'));
    }
    updates.email = email;
  }
  if (req.body?.role !== undefined || req.body?.isAdmin !== undefined) {
    if (!role) {
      return next(errorHandler(400, 'Invalid role provided'));
    }
    updates.role = role;
  }
  if (req.body?.profilePicture !== undefined) {
    updates.profilePicture = profilePicture || null;
  }
  if (req.body?.password !== undefined) {
    if (!password || password.length < 8) {
      return next(errorHandler(400, 'Password must be at least 8 characters long'));
    }
    updates.passwordHash = await bcryptjs.hash(password, 10);
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    if (updates.role && user.role === 'ADMIN' && updates.role !== 'ADMIN') {
      await ensureNotLastAdmin(user);
    }

    if (updates.email || updates.username) {
      const existing = await User.findOne({
        _id: { $ne: user._id },
        $or: [
          updates.email ? { email: updates.email } : null,
          updates.username ? { username: updates.username } : null,
        ].filter(Boolean),
      });
      if (existing) {
        return next(errorHandler(409, 'User with this email or username already exists'));
      }
    }

    Object.assign(user, updates);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    await ensureNotLastAdmin(user);
    await user.deleteOne();
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminUserRole = async (req, res, next) => {
  const role = normalizeRole(req.body?.role);
  if (!role) {
    return next(errorHandler(400, 'Invalid role provided'));
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    if (user.role === 'ADMIN' && role !== 'ADMIN') {
      await ensureNotLastAdmin(user);
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    return next(error);
  }
};

export const toggleAdminUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (user.role === 'ADMIN' && nextRole !== 'ADMIN') {
      await ensureNotLastAdmin(user);
    }

    user.role = nextRole;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User role toggled successfully',
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    return next(error);
  }
};
