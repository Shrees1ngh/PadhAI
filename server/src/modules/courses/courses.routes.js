import { Router } from "express";
import {
  generateOutline,
  modifyOutline,
  saveCourse,
  getCourses,
  getCourseById,
} from "./courses.controller.js";
import { optionalAuthenticateToken } from "../auth/auth.middleware.js";

const router = Router();

// Course creation & generation flow
router.post("/generate-outline", generateOutline);
router.post("/modify-outline", modifyOutline);
router.post("/save", optionalAuthenticateToken, saveCourse);

// Course retrieval
router.get("/", optionalAuthenticateToken, getCourses);
router.get("/:id", optionalAuthenticateToken, getCourseById);

export default router;
