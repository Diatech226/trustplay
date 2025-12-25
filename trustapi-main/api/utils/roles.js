export const allowedAgencyRoles = ['ADMIN', 'EDITOR', 'AUTHOR'];

export const hasRole = (user, roles = allowedAgencyRoles) => {
  if (!user?.role) return false;
  return roles.includes(user.role);
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
