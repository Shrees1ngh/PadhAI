import { Router } from "express";
import { getDbStatus } from "../../config/db.js";

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

export default router;
