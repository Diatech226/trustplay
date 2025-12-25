import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

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

export const verifyToken = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
      if (err || !decodedUser) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid token" });
      }
      req.user = {
        id: decodedUser.id,
        email: decodedUser.email,
        role: decodedUser.role,
      };
      req.token = token;
      next();
    });
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
