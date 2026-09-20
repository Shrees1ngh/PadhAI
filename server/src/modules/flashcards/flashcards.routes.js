import { Router } from "express";
import {
  generateFlashcardsHandler,
  saveFlashcardsHandler,
  getLessonFlashcardsHandler,
} from "./flashcards.controller.js";
import { optionalAuthenticateToken } from "../auth/auth.middleware.js";

const router = Router();

// Flashcard Generation & Retrieval Endpoints
router.post("/generate", generateFlashcardsHandler);
router.post("/save", optionalAuthenticateToken, saveFlashcardsHandler);
router.get("/:courseId/:moduleIndex/:lessonIndex", optionalAuthenticateToken, getLessonFlashcardsHandler);

// Status route
router.get("/", (req, res) => {
  res.json({
    module: "flashcards",
    status: "active",
    endpoints: [
      "POST /api/flashcards/generate",
      "POST /api/flashcards/save",
      "GET /api/flashcards/:courseId/:moduleIndex/:lessonIndex",
    ],
  });
});

export default router;
