import { Router } from "express";
import { searchVideos } from "./youtube.controller.js";

const router = Router();

// Search YouTube educational videos for a lesson
router.get("/search", searchVideos);

export default router;
