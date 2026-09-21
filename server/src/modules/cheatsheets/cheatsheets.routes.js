import { Router } from "express";
import {
  generateCheatsheetHandler,
  saveCheatsheetHandler,
  getLessonCheatsheetHandler,
} from "./cheatsheets.controller.js";
import { authenticateToken, optionalAuthenticateToken } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Cheatsheet Generation & Retrieval Endpoints
router.post("/generate", aiRateLimiter, optionalAuthenticateToken, generateCheatsheetHandler);
router.post("/save", authenticateToken, saveCheatsheetHandler);
router.get("/:courseId/:moduleIndex/:lessonIndex", authenticateToken, getLessonCheatsheetHandler);

// Status route
router.get("/", (req, res) => {
  res.json({
    module: "cheatsheets",
    status: "active",
    endpoints: [
      "POST /api/cheatsheets/generate",
      "POST /api/cheatsheets/save",
      "GET /api/cheatsheets/:courseId/:moduleIndex/:lessonIndex",
    ],
  });
});

export default router;
