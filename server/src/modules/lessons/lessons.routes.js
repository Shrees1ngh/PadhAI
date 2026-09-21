import { Router } from "express";
import {
  generateLesson,
  saveLesson,
  getLesson,
  markLessonComplete,
} from "./lessons.controller.js";

import { authenticateToken, optionalAuthenticateToken } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Lesson generation & persistence endpoints
router.post("/generate", aiRateLimiter, optionalAuthenticateToken, generateLesson);
router.post("/save", authenticateToken, saveLesson);
router.get("/:courseId/:moduleIndex/:lessonIndex", authenticateToken, getLesson);
router.patch("/:courseId/:moduleIndex/:lessonIndex/complete", authenticateToken, markLessonComplete);

export default router;
