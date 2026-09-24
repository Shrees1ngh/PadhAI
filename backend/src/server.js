import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

// Import module routers
import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import coursesRoutes from "./modules/courses/courses.routes.js";
import lessonsRoutes from "./modules/lessons/lessons.routes.js";
import quizzesRoutes from "./modules/quizzes/quizzes.routes.js";
import progressRoutes from "./modules/progress/progress.routes.js";
import aiTutorRoutes from "./modules/ai-tutor/aiTutor.routes.js";
import studyMaterialsRoutes from "./modules/study-materials/studyMaterials.routes.js";
import cheatsheetsRoutes from "./modules/cheatsheets/cheatsheets.routes.js";
import flashcardsRoutes from "./modules/flashcards/flashcards.routes.js";
import youtubeRoutes from "./modules/youtube/youtube.routes.js";
import topicsRoutes from "./modules/topics/topics.routes.js";

import { securityHeadersMiddleware } from "./modules/auth/securityHeaders.middleware.js";

const app = express();

// Trust Proxy in production (Render, Heroku, reverse proxies) or when explicitly flagged
const isProduction = process.env.NODE_ENV === "production" || ENV.NODE_ENV === "production";
if (ENV.TRUST_PROXY || process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true" || isProduction) {
  app.set("trust proxy", 1);
}

// Security Middleware: Helmet & Custom Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(securityHeadersMiddleware);

// Strict CORS Middleware
const allowedOrigins = [
  ENV.CLIENT_URL,
  "https://kro-padhai.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
]
  .filter(Boolean)
  .map((url) => url.trim().replace(/\/+$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.trim().replace(/\/+$/, "");
      let isAllowed = allowedOrigins.includes(cleanOrigin);
      if (!isAllowed) {
        try {
          const parsed = new URL(cleanOrigin);
          if (parsed.hostname.endsWith(".vercel.app") || parsed.hostname === "kro-padhai.vercel.app") {
            isAllowed = true;
          }
        } catch {}
      }

      if (isAllowed) {
        return callback(null, true);
      }
      const corsErr = new Error(`CORS Error: Origin ${origin} not permitted.`);
      corsErr.status = 403;
      corsErr.code = "CORS_FORBIDDEN";
      return callback(corsErr);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(mongoSanitize());

app.use(
  morgan("dev", {
    skip: (req, res) => req.originalUrl === "/api/health" && res.statusCode < 400,
  })
);

// Health Route
app.use("/api", healthRoutes);

// Register Core Modules
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/topics", topicsRoutes);
app.use("/api/quizzes", quizzesRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ai-tutor", aiTutorRoutes);
app.use("/api/study-materials", studyMaterialsRoutes);
app.use("/api/cheatsheets", cheatsheetsRoutes);
app.use("/api/flashcards", flashcardsRoutes);
app.use("/api/youtube", youtubeRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    name: "PadhAI API",
    description: "AI-Powered Personal Learning Platform Backend",
    healthCheck: "/api/health",
    documentation: "See /api/health for registered architecture modules",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // CORS Rejections return 403 JSON
  if (
    err.status === 403 ||
    err.code === "CORS_FORBIDDEN" ||
    (err.message && err.message.startsWith("CORS Error"))
  ) {
    return res.status(403).json({
      success: false,
      code: "CORS_FORBIDDEN",
      error: "CORS policy does not allow access from this origin",
      message: "CORS policy does not allow access from this origin",
    });
  }

  console.error("Server Error:", err);
  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === "production" || ENV.NODE_ENV === "production";

  // In production, do not leak raw 5xx internal error messages
  const message =
    isProduction && status >= 500
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    ...(err.code ? { code: err.code } : {}),
  });
});

// Start Server & Connect Database
const startServer = () => {
  const server = app.listen(ENV.PORT, "0.0.0.0", () => {
    console.log(`\n=================================================`);
    console.log(`🚀 PadhAI Server running on http://localhost:${ENV.PORT}`);
    console.log(`🩺 Health Check: http://localhost:${ENV.PORT}/api/health`);
    console.log(`🌐 Allowed Client: ${ENV.CLIENT_URL}`);
    console.log(`=================================================\n`);
  });

  // Connect to DB asynchronously so HTTP routes and health checks are available immediately
  connectDB().catch((err) => {
    console.warn("DB initialization non-fatal error:", err.message);
  });

  return server;
};

startServer();

export default app;
