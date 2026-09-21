import { Router } from "express";
import { chatWithTutor } from "./aiTutor.controller.js";
import { optionalAuthenticateToken } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Contextual AI Tutor chat endpoint for current lesson (Rate limited)
router.post("/chat", aiRateLimiter, optionalAuthenticateToken, chatWithTutor);
router.post("/ask", aiRateLimiter, optionalAuthenticateToken, chatWithTutor);

export default router;
