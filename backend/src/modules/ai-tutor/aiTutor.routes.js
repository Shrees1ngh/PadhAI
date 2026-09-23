import { Router } from "express";
import { chatWithTutor } from "./aiTutor.controller.js";
import { requireAuthOrCustomKey } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Contextual AI Tutor chat endpoint for current lesson (Auth runs before rate limiter, require auth unless custom key)
router.post("/chat", requireAuthOrCustomKey, aiRateLimiter, chatWithTutor);
router.post("/ask", requireAuthOrCustomKey, aiRateLimiter, chatWithTutor);

export default router;
