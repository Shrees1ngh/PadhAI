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
        message: "Authentication required. Please provide a valid authorization token.",
      });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid or malformed authentication token.",
      });
    }

    // Attach basic decoded info immediately
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      avatar: decoded.avatar || "",
    };

    // Attempt to verify against active database user if DB is connected
    try {
      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(decoded.id).select("-passwordHash");
        if (user) {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            avatar: user.avatar || "",
            authProvider: user.authProvider,
          };
        }
      }
    } catch (dbErr) {
      // Continue with decoded token payload if DB read is transiently unavailable
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

// Aliases for convenience and backward compatibility
export const authMiddleware = authenticateToken;
export const optionalAuthMiddleware = optionalAuthenticateToken;
