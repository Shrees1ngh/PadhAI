import { Router } from "express";
import {
  generateQuiz,
  saveQuiz,
  getLessonQuiz,
} from "./quizzes.controller.js";
import { optionalAuthenticateToken } from "../auth/auth.middleware.js";

const router = Router();

// Quiz generation & attempt submission
router.post("/generate", generateQuiz);
router.post("/save", optionalAuthenticateToken, saveQuiz);

// Quiz retrieval for active lesson
router.get("/:courseId/:moduleIndex/:lessonIndex", optionalAuthenticateToken, getLessonQuiz);

export default router;
