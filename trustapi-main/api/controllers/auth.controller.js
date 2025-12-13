import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

const sanitizeUser = (userDoc = {}) => {
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete userObj.password;
  delete userObj.passwordHash;
  return userObj;
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return next(errorHandler(409, 'User with this email or username already exists'));
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword,
      role: 'USER',
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      data: { user: sanitizeUser(newUser) },
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === '' || password === '') {
    return next(errorHandler(400, 'Email and password are required'));
  }

  try {
    const validUser = await User.findOne({ email: email.toLowerCase() });
    if (!validUser) {
      return next(errorHandler(401, 'Invalid credentials'));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.passwordHash);
    if (!validPassword) {
      return next(errorHandler(401, 'Invalid credentials'));
    }

    const token = jwt.sign(
      { id: validUser._id, email: validUser.email, role: validUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = sanitizeUser(validUser);

    res.status(200).json({
      success: true,
      data: { user: userProfile, token },
    });
  } catch (error) {
    next(error);
  }
};

export const signout = (_req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'User has been signed out' });
  } catch (error) {
    next(error);
  }
};
