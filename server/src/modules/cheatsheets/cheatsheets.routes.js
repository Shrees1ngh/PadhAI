import { Router } from "express";
import {
  generateCheatsheetHandler,
  saveCheatsheetHandler,
  getLessonCheatsheetHandler,
} from "./cheatsheets.controller.js";
import { optionalAuthenticateToken } from "../auth/auth.middleware.js";

const router = Router();

// Cheatsheet Generation & Retrieval Endpoints
router.post("/generate", generateCheatsheetHandler);
router.post("/save", optionalAuthenticateToken, saveCheatsheetHandler);
router.get("/:courseId/:moduleIndex/:lessonIndex", optionalAuthenticateToken, getLessonCheatsheetHandler);

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
