import { Router } from "express";
import { chatWithTutor } from "./aiTutor.controller.js";

const router = Router();

// Contextual AI Tutor chat endpoint for current lesson
router.post("/chat", chatWithTutor);

export default router;
