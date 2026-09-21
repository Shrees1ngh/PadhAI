import { Router } from "express";
import {
  generateFlashcardsHandler,
  saveFlashcardsHandler,
  getLessonFlashcardsHandler,
} from "./flashcards.controller.js";
import { authenticateToken, requireAuthOrCustomKey } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Flashcard Generation & Retrieval Endpoints (Auth runs before rate limiter, require auth unless custom key)
router.post("/generate", requireAuthOrCustomKey, aiRateLimiter, generateFlashcardsHandler);
router.post("/save", authenticateToken, saveFlashcardsHandler);
router.get("/:courseId/:moduleIndex/:lessonIndex", authenticateToken, getLessonFlashcardsHandler);

// Status route
router.get("/", (req, res) => {
  res.json({
    module: "flashcards",
    status: "active",
    endpoints: [
      "POST /api/flashcards/generate",
      "POST /api/flashcards/save",
      "GET /api/flashcards/:courseId/:moduleIndex/:lessonIndex",
    ],
  });
});

export default router;
