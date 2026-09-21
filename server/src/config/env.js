import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Validate JWT Secret in production
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    throw new Error(
      "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing in production. Server startup aborted."
    );
  } else {
    // Generate a per-process secure secret in development if not explicitly configured
    jwtSecret = process.env.DEV_JWT_SECRET || "padhai_dev_secret_" + crypto.randomBytes(32).toString("hex");
  }
}

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/padhai",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.6-flash",
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || "",
  JWT_SECRET: jwtSecret,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5000/api/auth/google/callback",
};
