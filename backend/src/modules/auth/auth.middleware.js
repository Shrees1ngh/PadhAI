import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./user.model.js";
import { ENV } from "../../config/env.js";

/**
 * Mandatory authentication middleware.
 * Rejects requests without a valid Bearer JWT.
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in or provide your own Gemini API key.",
      });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid or malformed authentication token.",
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(decoded.id);
      let user = null;
      if (isValidObjectId) {
        user = await User.findById(decoded.id).select("-passwordHash");
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          code: "USER_NOT_FOUND",
          message: "User account no longer exists. Please log in again.",
        });
      }

      req.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar || "",
        authProvider: user.authProvider,
        emailVerified: !!user.emailVerified,
      };
    } else {
      const isProduction = process.env.NODE_ENV === "production" || ENV.NODE_ENV === "production";
      if (isProduction) {
        return res.status(503).json({
          success: false,
          code: "DATABASE_UNAVAILABLE",
          message: "Authentication service temporarily unavailable in production.",
        });
      }
      // Dev mode fallback
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.avatar || "",
        authProvider: decoded.authProvider || "local",
      };
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Your session has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "Authentication failed. Invalid token.",
    });
  }
};

/**
 * Optional authentication middleware.
 * Attaches req.user if a valid token is present, but allows unauthenticated requests to proceed.
 */
export const optionalAuthenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (decoded && decoded.id) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.avatar || "",
      };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
};

/**
 * Authentication middleware for AI generation endpoints:
 * Requires authentication UNLESS the request carries the user's personal x-gemini-key.
 * If x-gemini-key is present, still attempts optional authentication to populate req.user if logged in.
 */
export const requireAuthOrCustomKey = async (req, res, next) => {
  const customKey =
    req.headers["x-gemini-key"] ||
    req.headers["x-api-key"] ||
    req.body?.apiKey;

  if (customKey && typeof customKey === "string" && customKey.trim().length > 0) {
    return optionalAuthenticateToken(req, res, next);
  }

  return authenticateToken(req, res, next);
};

// Aliases for convenience and backward compatibility
export const authMiddleware = authenticateToken;
export const optionalAuthMiddleware = optionalAuthenticateToken;
