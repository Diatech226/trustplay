import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { generatePasswordResetToken, hashResetToken } from '../utils/passwordReset.js';
import { sendResetPasswordEmail } from '../utils/mailer.js';

const sanitizeUser = (userDoc = {}) => {
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete userObj.password;
  delete userObj.passwordHash;
  delete userObj.passwordResetTokenHash;
  delete userObj.passwordResetExpiresAt;
  return userObj;
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, 'All fields are required'));
  }

  if (password.length < 8) {
    return next(errorHandler(400, 'Password must be at least 8 characters long'));
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

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(errorHandler(400, 'Email is required'));
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const { resetToken, resetTokenHash, passwordResetExpiresAt } = generatePasswordResetToken();
      user.passwordResetTokenHash = resetTokenHash;
      user.passwordResetExpiresAt = passwordResetExpiresAt;
      await user.save();

      const frontendUrl = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173')
        .split(',')[0]
        .replace(/\/$/, '');
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
        user.email
      )}`;

      try {
        await sendResetPasswordEmail(user.email, resetUrl);
      } catch (error) {
        console.error('Failed to send reset email', error.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Si un compte existe, un lien de réinitialisation a été envoyé.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return next(errorHandler(400, 'Email, token and new password are required'));
  }

  if (newPassword.length < 8) {
    return next(errorHandler(400, 'Password must be at least 8 characters long'));
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordResetTokenHash || !user.passwordResetExpiresAt) {
      return next(errorHandler(400, 'Invalid or expired reset token'));
    }

    if (user.passwordResetExpiresAt.getTime() < Date.now()) {
      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;
      await user.save();
      return next(errorHandler(400, 'Reset token has expired'));
    }

    const hashedToken = hashResetToken(token);
    if (hashedToken !== user.passwordResetTokenHash) {
      return next(errorHandler(400, 'Invalid or expired reset token'));
    }

    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    const authToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = sanitizeUser(user);

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour.',
      data: { token: authToken, user: userProfile },
    });
  } catch (error) {
    next(error);
  }
};
