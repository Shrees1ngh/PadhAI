import { Router } from "express";
import {
  generateLesson,
  saveLesson,
  getLesson,
  markLessonComplete,
} from "./lessons.controller.js";

const router = Router();

// Lesson generation & persistence endpoints
router.post("/generate", generateLesson);
router.post("/save", saveLesson);
router.get("/:courseId/:moduleIndex/:lessonIndex", getLesson);
router.patch("/:courseId/:moduleIndex/:lessonIndex/complete", markLessonComplete);

export default router;
