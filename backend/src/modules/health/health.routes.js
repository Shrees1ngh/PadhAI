import { Router } from "express";
import { getDbStatus } from "../../config/db.js";
import { ENV } from "../../config/env.js";
import { isOllamaAvailable } from "../../lib/ollama.service.js";

const router = Router();

router.get("/health", (req, res) => {
  const dbStatus = getDbStatus();

  res.status(200).json({
    status: "ok",
    platform: "PadhAI - AI-Powered Personal Learning Platform",
    version: "1.0.0",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      ready: dbStatus === "connected",
      message: dbStatus === "connected" 
        ? "Database connection active" 
        : "Database offline. Set MONGO_URI in server/.env or start local MongoDB service."
    },
    ai: {
      provider: ENV.AI_PROVIDER || "ollama",
      ollamaModel: ENV.OLLAMA_MODEL || "qwen2.5:7b",
      ollamaUrl: ENV.OLLAMA_BASE_URL || "http://localhost:11434",
      geminiConfigured: Boolean(ENV.GEMINI_API_KEY),
    },
    modules: {
      auth: { path: "/api/auth", status: "scaffolded" },
      courses: { path: "/api/courses", status: "scaffolded" },
      lessons: { path: "/api/lessons", status: "scaffolded" },
      quizzes: { path: "/api/quizzes", status: "scaffolded" },
      progress: { path: "/api/progress", status: "scaffolded" },
      aiTutor: { path: "/api/ai-tutor", status: "scaffolded" },
      studyMaterials: { path: "/api/study-materials", status: "scaffolded" },
      cheatsheets: { path: "/api/cheatsheets", status: "scaffolded" },
      flashcards: { path: "/api/flashcards", status: "scaffolded" },
      youtube: { path: "/api/youtube", status: "scaffolded" },
    }
  });
});

// Live AI provider status check — GET /api/health/ai
router.get("/health/ai", async (req, res) => {
  const provider = ENV.AI_PROVIDER || "ollama";
  const ollamaUp = await isOllamaAvailable();

  const activeProvider =
    provider === "gemini"
      ? "gemini"
      : ollamaUp
      ? "ollama"
      : ENV.GEMINI_API_KEY
      ? "gemini (fallback)"
      : "none";

  res.status(ollamaUp || ENV.GEMINI_API_KEY ? 200 : 503).json({
    configured: provider,
    active: activeProvider,
    ollama: {
      available: ollamaUp,
      url: ENV.OLLAMA_BASE_URL || "http://localhost:11434",
      model: ENV.OLLAMA_MODEL || "qwen2.5:7b",
    },
    gemini: {
      configured: Boolean(ENV.GEMINI_API_KEY),
      note: ENV.GEMINI_API_KEY ? "Available as fallback" : "No key configured",
    },
  });
});

export default router;
