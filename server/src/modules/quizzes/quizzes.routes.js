import { Router } from "express";
import {
  generateQuiz,
  saveQuiz,
  getLessonQuiz,
} from "./quizzes.controller.js";
import { authenticateToken, optionalAuthenticateToken } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Quiz generation & attempt submission
router.post("/generate", aiRateLimiter, optionalAuthenticateToken, generateQuiz);
router.post("/save", authenticateToken, saveQuiz);

// Quiz retrieval for active lesson (Isolated per user)
router.get("/:courseId/:moduleIndex/:lessonIndex", authenticateToken, getLessonQuiz);

export default router;
