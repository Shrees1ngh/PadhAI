import { Router } from "express";
import {
  quickLearnTopic,
  saveTopic,
  getSavedTopics,
  completeTopic,
} from "./topics.controller.js";
import { authenticateToken, optionalAuthenticateToken } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Quick Learn generation (Rate limited AI generation)
router.post("/quick-learn", aiRateLimiter, optionalAuthenticateToken, quickLearnTopic);

// Save topic to profile (Authenticated)
router.post("/save", authenticateToken, saveTopic);

// Retrieve saved topics (Strictly isolated per user)
router.get("/saved", authenticateToken, getSavedTopics);

// Mark topic completed (Strictly isolated per user)
router.patch("/:id/complete", authenticateToken, completeTopic);

export default router;
