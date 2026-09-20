import { Router } from "express";

const router = Router();

// Placeholder routes for progress module
router.get("/", (req, res) => {
  res.json({
    module: "progress",
    endpoints: [
      "GET /:courseId",
      "POST /complete-topic",
      "GET /enrolled-courses"
    ],
    status: "ready for implementation"
  });
});

export default router;
