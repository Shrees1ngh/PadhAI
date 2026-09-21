import express from "express";
import cors from "cors";
import morgan from "morgan";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

// Import module routers (Updated for Study Materials Analyzer v1.0)
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

// Security Headers Middleware
app.use(securityHeadersMiddleware);

// Strict CORS Middleware
const allowedOrigins = [
  ENV.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS Error: Origin ${origin} not permitted.`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
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
    documentation: "See /api/health for registered architecture modules"
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
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.warn("DB initialization non-fatal error:", err.message);
  }

  app.listen(ENV.PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 PadhAI Server running on http://localhost:${ENV.PORT}`);
    console.log(`🩺 Health Check: http://localhost:${ENV.PORT}/api/health`);
    console.log(`🌐 Allowed Client: ${ENV.CLIENT_URL}`);
    console.log(`=================================================\n`);
  });
};

startServer();

export default app;
