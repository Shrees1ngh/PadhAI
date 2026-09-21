import { Router } from "express";
import {
  generateOutline,
  modifyOutline,
  saveCourse,
  getCourses,
  getCourseById,
} from "./courses.controller.js";
import { authenticateToken, optionalAuthenticateToken } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Course creation & generation flow (Rate limited AI generation)
router.post("/generate-outline", aiRateLimiter, optionalAuthenticateToken, generateOutline);
router.post("/modify-outline", aiRateLimiter, optionalAuthenticateToken, modifyOutline);
router.post("/save", authenticateToken, saveCourse);
router.post("/", authenticateToken, saveCourse);

// Course retrieval (Strictly authenticated & isolated per user)
router.get("/", authenticateToken, getCourses);
router.get("/:id", authenticateToken, getCourseById);

export default router;
