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
    const authorization = req.headers.authorization || req.headers.Authorization;
    const bearerToken =
      typeof authorization === "string" && authorization.startsWith("Bearer ")
        ? authorization.replace("Bearer ", "")
        : null;
    const cookieToken = req.cookies?.access_token;
    const token = bearerToken || cookieToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid or missing token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
      if (err) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid or missing token" });
      }
      req.user = decodedUser;
      next();
    });
  } catch (error) {
    next(errorHandler(500, "Internal Server Error"));
  }
};



