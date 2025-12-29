import { USER_ROLES } from '../models/user.model.js';

export const allowedAgencyRoles = ['ADMIN'];

export const normalizeRoleValue = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const role = String(value).trim().toUpperCase();
  return USER_ROLES.includes(role) ? role : null;
};

export const resolveUserRole = (user) => {
  const normalized = normalizeRoleValue(user?.role);
  if (normalized) return normalized;
  if (user?.isAdmin === true) return 'ADMIN';
  return null;
};

export const ensureUserRole = async (user) => {
  if (!user) return null;
  const resolved = resolveUserRole(user) || 'USER';
  if (user.role !== resolved) {
    user.role = resolved;
    await user.save({ validateBeforeSave: false });
  }
  return resolved;
};

export const hasRole = (user, roles = allowedAgencyRoles) => {
  const role = resolveUserRole(user);
  if (!role) return false;
  return roles.includes(role);
};

export const requireRoles = (...roles) => (req, res, next) => {
  const allowed = roles.length ? roles : allowedAgencyRoles;
  if (!hasRole(req.user, allowed)) {
    return res
      .status(403)
      .json({ success: false, message: 'Forbidden: insufficient permissions' });
  }
  return next();
};
