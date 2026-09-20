import mongoose from "mongoose";
import Lesson from "./lesson.model.js";
import {
  generateLessonInputSchema,
  saveLessonInputSchema,
} from "./lesson.validator.js";
import {
  generateLessonContentWithGemini,
  getBloomTaxonomyStage,
} from "../../lib/lesson.service.js";
import { getDbStatus } from "../../config/db.js";

/**
 * Generate rich structured lesson content using Gemini
 * POST /api/lessons/generate
 */
export const generateLesson = async (req, res) => {
  try {
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;

    const validatedInput = generateLessonInputSchema.parse({
      ...req.body,
      apiKey,
    });

    const lessonContent = await generateLessonContentWithGemini({
      ...validatedInput,
      apiKey,
    });

    const bloomStage = getBloomTaxonomyStage(
      validatedInput.moduleIndex,
      validatedInput.totalModules
    );

    res.status(200).json({
      success: true,
      message: "Lesson content generated successfully",
      lesson: lessonContent,
      meta: {
        moduleIndex: validatedInput.moduleIndex,
        lessonIndex: validatedInput.lessonIndex,
        bloomTaxonomyStage: bloomStage,
        level: validatedInput.currentLevel,
      },
    });
  } catch (error) {
    console.error("Error in generateLesson:", error.message);
    const status = error.status || (error.name === "ZodError" ? 400 : 500);
    res.status(status).json({
      success: false,
      message: error.message || "Failed to generate lesson content",
      code: error.code || "LESSON_GENERATION_ERROR",
      errors: error.errors || null,
    });
  }
};

/**
 * Save generated lesson to MongoDB
 * POST /api/lessons/save
 */
export const saveLesson = async (req, res) => {
  try {
    const validatedData = saveLessonInputSchema.parse(req.body);
    const isDbReady = mongoose.connection.readyState === 1;

    // Check MongoDB availability — never create fake persistence
    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message:
          "MongoDB is currently offline. Lesson content was generated successfully, but cannot be persisted to the database. To enable persistence, ensure MongoDB is running or configure MONGO_URI in server/.env.",
        lesson: validatedData.lessonContent,
        dbStatus: getDbStatus(),
      });
    }

    // Upsert lesson in MongoDB
    const lesson = await Lesson.findOneAndUpdate(
      {
        courseId: validatedData.courseId,
        moduleIndex: validatedData.moduleIndex,
        lessonIndex: validatedData.lessonIndex,
      },
      {
        courseId: validatedData.courseId,
        moduleIndex: validatedData.moduleIndex,
        lessonIndex: validatedData.lessonIndex,
        level: validatedData.level,
        bloomTaxonomyStage: validatedData.bloomTaxonomyStage,
        ...validatedData.lessonContent,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Lesson saved to MongoDB database",
      lesson,
    });
  } catch (error) {
    console.error("Error in saveLesson:", error.message);
    const status = error.name === "ZodError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to save lesson",
      errors: error.errors || null,
    });
  }
};

/**
 * Retrieve saved lesson from MongoDB
 * GET /api/lessons/:courseId/:moduleIndex/:lessonIndex
 */
export const getLesson = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message: "MongoDB is offline. Cannot query stored lesson.",
      });
    }

    const { courseId, moduleIndex, lessonIndex } = req.params;

    const lesson = await Lesson.findOne({
      courseId,
      moduleIndex: parseInt(moduleIndex, 10),
      lessonIndex: parseInt(lessonIndex, 10),
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in database",
      });
    }

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving lesson",
    });
  }
};

/**
 * Mark lesson as completed in MongoDB
 * PATCH /api/lessons/:courseId/:moduleIndex/:lessonIndex/complete
 */
export const markLessonComplete = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message: "MongoDB is offline. Progress cannot be saved to database.",
      });
    }

    const { courseId, moduleIndex, lessonIndex } = req.params;
    const { completed = true } = req.body;

    const lesson = await Lesson.findOneAndUpdate(
      {
        courseId,
        moduleIndex: parseInt(moduleIndex, 10),
        lessonIndex: parseInt(lessonIndex, 10),
      },
      { completed },
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found to update completion status",
      });
    }

    res.status(200).json({
      success: true,
      message: completed ? "Lesson marked as complete" : "Lesson marked as incomplete",
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating lesson progress",
    });
  }
};
