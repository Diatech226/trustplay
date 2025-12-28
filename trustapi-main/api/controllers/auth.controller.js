import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { generatePasswordResetToken, hashResetToken } from '../utils/passwordReset.js';
import { sendResetPasswordEmail } from '../utils/mailer.js';
import { ensureUserRole, resolveUserRole } from '../utils/roles.js';
import { getAdminEmailSet, isAdminEmail } from '../utils/adminEmails.js';

const authCookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const clearSessionCookie = (res) => {
  res.clearCookie('access_token', authCookieOptions);
};

const sanitizeUser = (userDoc = {}) => {
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete userObj.password;
  delete userObj.passwordHash;
  delete userObj.passwordResetTokenHash;
  delete userObj.passwordResetExpiresAt;
  const resolvedRole = resolveUserRole(userObj) || 'USER';
  userObj.role = resolvedRole;
  return userObj;
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const adminEmails = getAdminEmailSet();

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const shouldBeAdmin = isAdminEmail(email, adminEmails);
    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword,
      authProvider: 'local',
      role: shouldBeAdmin ? 'ADMIN' : 'USER',
    });

    await newUser.save();
    const resolvedRole = await ensureUserRole(newUser);

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in the environment variables.');
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: resolvedRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = sanitizeUser(newUser);

    res.status(201).json({
      success: true,
      data: { user: userProfile, token },
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body || {};
  const adminEmails = getAdminEmailSet();

  if (!email || !password || email === '' || password === '') {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const validUser = await User.findOne({ email: email.toLowerCase() });
    if (!validUser) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (validUser.authProvider && validUser.authProvider !== 'local') {
      return res
        .status(400)
        .json({ success: false, message: 'Connectez-vous via votre fournisseur SSO (Google/Firebase).' });
    }

    if (!validUser.passwordHash) {
      return res.status(400).json({ success: false, message: 'No local password is set for this account.' });
    }

    const validPassword = await bcrypt.compare(password, validUser.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in the environment variables.');
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (isAdminEmail(validUser.email, adminEmails) && validUser.role !== 'ADMIN') {
      validUser.role = 'ADMIN';
      await validUser.save({ validateBeforeSave: false });
    }

    const resolvedRole = await ensureUserRole(validUser);
    const token = jwt.sign(
      {
        id: validUser._id,
        email: validUser.email,
        role: resolvedRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = sanitizeUser(validUser);

    return res.status(200).json({
      success: true,
      data: { user: userProfile, token },
    });
  } catch (error) {
    console.error('Signin error:', error.stack || error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const signout = (_req, res, next) => {
  try {
    clearSessionCookie(res);
    res.status(200).json({ success: true, message: 'User has been signed out' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body || {};

  try {
    if (!email) {
      console.warn('[FORGOT_PASSWORD] Email is missing in request body');
      return res.status(200).json({
        success: true,
        message: 'Si un compte existe, un lien a été envoyé.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const { resetToken, resetTokenHash, passwordResetExpiresAt } = generatePasswordResetToken();
      user.passwordResetTokenHash = resetTokenHash;
      user.passwordResetExpiresAt = passwordResetExpiresAt;
      await user.save({ validateBeforeSave: false });

      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
        user.email
      )}`;

      const mailDelivered = await sendResetPasswordEmail(user.email, resetUrl);
      if (!mailDelivered) {
        console.error('[FORGOT_PASSWORD] Mailer failed to send reset email');
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Si un compte existe, un lien a été envoyé.',
    });
  } catch (error) {
    console.error('Forgot password error:', error.stack || error);
    return res.status(200).json({
      success: true,
      message: 'Si un compte existe, un lien a été envoyé.',
    });
  }
};

export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body || {};
  const logPrefix = '[RESET_PASSWORD]';
  let lastAction = 'starting';

  if (!email || !token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, token and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
  }

  try {
    lastAction = 'fetching user';
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordResetTokenHash || !user.passwordResetExpiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    if (user.passwordResetExpiresAt.getTime() < Date.now()) {
      lastAction = 'saving expired token cleanup';
      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;
      await user.save();
      return res.status(400).json({ success: false, message: 'Reset token has expired' });
    }

    const hashedToken = hashResetToken(token);
    if (hashedToken !== user.passwordResetTokenHash) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    lastAction = 'saving new password';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.authProvider = 'local';
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in the environment variables.');
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    const resolvedRole = await ensureUserRole(user);
    const authToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: resolvedRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = sanitizeUser(user);
    persistSessionCookie(res, authToken);

    return res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour.',
      data: { token: authToken, user: userProfile },
    });
  } catch (error) {
    console.error(`${logPrefix} ${lastAction} failed:`, error.message);
    console.error(error.stack || error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
