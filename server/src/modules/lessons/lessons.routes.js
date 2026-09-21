import { Router } from "express";
import {
  generateLesson,
  saveLesson,
  getLesson,
  markLessonComplete,
} from "./lessons.controller.js";

import { authenticateToken, requireAuthOrCustomKey } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Lesson generation & persistence endpoints (Auth runs before rate limiter, require auth unless custom key)
router.post("/generate", requireAuthOrCustomKey, aiRateLimiter, generateLesson);
router.post("/save", authenticateToken, saveLesson);
router.get("/:courseId/:moduleIndex/:lessonIndex", authenticateToken, getLesson);
router.patch("/:courseId/:moduleIndex/:lessonIndex/complete", authenticateToken, markLessonComplete);

export default router;
