import crypto from 'crypto';

export const generatePasswordResetToken = (expiresInMinutes = 15) => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const passwordResetExpiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  return { resetToken, resetTokenHash, passwordResetExpiresAt };
};

export const hashResetToken = (token = '') =>
  crypto.createHash('sha256').update(token).digest('hex');
