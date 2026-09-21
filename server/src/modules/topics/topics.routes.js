import { Router } from "express";
import {
  quickLearnTopic,
  saveTopic,
  getSavedTopics,
  deleteSavedTopic,
  completeTopic,
} from "./topics.controller.js";
import { authenticateToken, requireAuthOrCustomKey } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Quick Learn generation (Auth runs before rate limiter, require auth unless custom key)
router.post("/quick-learn", requireAuthOrCustomKey, aiRateLimiter, quickLearnTopic);

// Save topic to profile (Authenticated)
router.post("/save", authenticateToken, saveTopic);

// Retrieve saved topics (Strictly isolated per user)
router.get("/saved", authenticateToken, getSavedTopics);

// Delete saved topic (Authenticated)
router.delete("/:id", authenticateToken, deleteSavedTopic);

// Mark topic completed (Strictly isolated per user)
router.patch("/:id/complete", authenticateToken, completeTopic);

export default router;
