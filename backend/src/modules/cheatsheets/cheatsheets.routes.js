import { Router } from "express";
import {
  generateCheatsheetHandler,
  saveCheatsheetHandler,
  getLessonCheatsheetHandler,
  getSavedCheatsheetsHandler,
  deleteCheatsheetHandler,
} from "./cheatsheets.controller.js";
import { authenticateToken, requireAuthOrCustomKey } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Cheatsheet Generation & Retrieval Endpoints (Auth runs before rate limiter, require auth unless custom key)
router.post("/generate", requireAuthOrCustomKey, aiRateLimiter, generateCheatsheetHandler);
router.post("/save", authenticateToken, saveCheatsheetHandler);

// User saved collections
router.get("/saved", authenticateToken, getSavedCheatsheetsHandler);
router.get("/mine", authenticateToken, getSavedCheatsheetsHandler);
router.delete("/:id", authenticateToken, deleteCheatsheetHandler);

// Lesson specific
router.get("/:courseId/:moduleIndex/:lessonIndex", authenticateToken, getLessonCheatsheetHandler);

// Status route
router.get("/", (req, res) => {
  res.json({
    module: "cheatsheets",
    status: "active",
    endpoints: [
      "POST /api/cheatsheets/generate",
      "POST /api/cheatsheets/save",
      "GET /api/cheatsheets/mine",
      "GET /api/cheatsheets/saved",
      "DELETE /api/cheatsheets/:id",
      "GET /api/cheatsheets/:courseId/:moduleIndex/:lessonIndex",
    ],
  });
});

export default router;
