import { Router } from "express";
import {
  generateQuiz,
  saveQuiz,
  getLessonQuiz,
} from "./quizzes.controller.js";
import { authenticateToken, requireAuthOrCustomKey } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Quiz generation & attempt submission (Auth runs before rate limiter, require auth unless custom key)
router.post("/generate", requireAuthOrCustomKey, aiRateLimiter, generateQuiz);
router.post("/save", authenticateToken, saveQuiz);

// Quiz retrieval for active lesson (Isolated per user)
router.get("/:courseId/:moduleIndex/:lessonIndex", authenticateToken, getLessonQuiz);

export default router;
