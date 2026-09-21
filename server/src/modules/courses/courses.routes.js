import { Router } from "express";
import {
  generateOutline,
  modifyOutline,
  saveCourse,
  getCourses,
  getCourseById,
} from "./courses.controller.js";
import { authenticateToken, requireAuthOrCustomKey } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Course creation & generation flow (Auth runs before rate limiter, require auth unless custom key)
router.post("/generate-outline", requireAuthOrCustomKey, aiRateLimiter, generateOutline);
router.post("/modify-outline", requireAuthOrCustomKey, aiRateLimiter, modifyOutline);
router.post("/save", authenticateToken, saveCourse);
router.post("/", authenticateToken, saveCourse);

// Course retrieval (Strictly authenticated & isolated per user)
router.get("/", authenticateToken, getCourses);
router.get("/:id", authenticateToken, getCourseById);

export default router;
