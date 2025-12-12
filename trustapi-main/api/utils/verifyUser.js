/*import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies); // ✅ Debug cookies

    const token = req.cookies.access_token;
    if (!token) {
      return next(errorHandler(401, "Unauthorized"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return next(errorHandler(401, "Unauthorized"));
      }
      req.user = user;
      next();
    });
  } catch (error) {
    next(errorHandler(500, "Internal Server Error"));
  }
};*/
import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  try {
    console.log("Cookies reçus:", req.cookies); // ✅ Debug cookies

    const token = req.cookies?.access_token;
    if (!token) {
      return next(errorHandler(401, "Unauthorized: No token provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
      if (err) {
        return next(errorHandler(403, "Forbidden: Invalid token"));
      }
      req.user = decodedUser; // Stocker les infos de l'utilisateur
      next();
    });
  } catch (error) {
    next(errorHandler(500, "Internal Server Error"));
  }
};



