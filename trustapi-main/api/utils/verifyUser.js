import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  try {
    const authorization = req.headers.authorization || req.headers.Authorization;
    const token =
      typeof authorization === "string" && authorization.startsWith("Bearer ")
        ? authorization.replace("Bearer ", "")
        : null;

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
