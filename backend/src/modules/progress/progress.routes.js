import { Router } from "express";
import { authenticateToken } from "../auth/auth.middleware.js";
import {
  getCourseProgress,
  completeTopic,
  getEnrolledCourses,
} from "./progress.controller.js";

const router = Router();

// Module status route (no authentication required)
router.get("/", (req, res) => {
  res.json({
    module: "progress",
    endpoints: [
      "GET /enrolled-courses",
      "GET /:courseId",
      "POST /complete-topic",
    ],
    status: "active",
  });
});

/**
 * GET /api/progress/enrolled-courses
 * Returns aggregate progress across all enrolled courses.
 * Must be defined before /:courseId to avoid route collision.
 */
router.get("/enrolled-courses", authenticateToken, getEnrolledCourses);

/**
 * GET /api/progress/:courseId
 * Returns detailed progress for a specific course.
 */
router.get("/:courseId", authenticateToken, getCourseProgress);

/**
 * POST /api/progress/complete-topic
 * Marks a lesson topic as completed.
 * Body: { courseId, moduleIndex, lessonIndex }
 */
router.post("/complete-topic", authenticateToken, completeTopic);

export default router;
