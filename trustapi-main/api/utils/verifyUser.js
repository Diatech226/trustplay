import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from '../models/user.model.js';
import { ensureUserRole, normalizeRoleValue } from './roles.js';

const extractBearer = (value = "") => {
  if (typeof value !== "string") return null;
  if (!value.toLowerCase().startsWith("bearer")) return null;
  return value.replace(/bearer\s+/i, "").trim();
};

const getTokenFromRequest = (req) => {
  const authorization = req.headers.authorization || req.headers.Authorization;
  const headerToken = extractBearer(authorization);
  if (headerToken) return headerToken;

  const cookieToken = req.cookies?.access_token;
  if (cookieToken && typeof cookieToken === "string") return cookieToken;

  return null;
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    let decodedUser;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token" });
    }

    let normalizedRole = normalizeRoleValue(decodedUser?.role);
    if (!normalizedRole && decodedUser?.isAdmin === true) {
      normalizedRole = 'ADMIN';
    }

    if (!normalizedRole && decodedUser?.id) {
      const user = await User.findById(decodedUser.id);
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: User not found" });
      }
      const resolvedRole = await ensureUserRole(user);
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: resolvedRole,
      };
    } else {
      req.user = {
        id: decodedUser.id,
        email: decodedUser.email,
        role: normalizedRole,
      };
    }

    req.token = token;
    next();
  } catch (error) {
    next(errorHandler(500, "Internal Server Error"));
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Admin access required" });
  }
  return next();
};

export const verifyTokenOptional = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return next();

    let decodedUser;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return next();
    }

    let normalizedRole = normalizeRoleValue(decodedUser?.role);
    if (!normalizedRole && decodedUser?.isAdmin === true) {
      normalizedRole = 'ADMIN';
    }

    if (!normalizedRole && decodedUser?.id) {
      const user = await User.findById(decodedUser.id);
      if (user) {
        const resolvedRole = await ensureUserRole(user);
        req.user = {
          id: user._id.toString(),
          email: user.email,
          role: resolvedRole,
        };
      }
    } else if (normalizedRole) {
      req.user = {
        id: decodedUser.id,
        email: decodedUser.email,
        role: normalizedRole,
      };
    }

    if (req.user) {
      req.token = token;
    }

    return next();
  } catch (error) {
    return next();
  }
};
