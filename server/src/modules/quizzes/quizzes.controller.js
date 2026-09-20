import mongoose from "mongoose";
import Quiz from "./quiz.model.js";
import {
  generateQuizInputSchema,
  saveQuizInputSchema,
} from "./quiz.validator.js";
import { generateQuizWithGemini } from "../../lib/quiz.service.js";
import { getDbStatus } from "../../config/db.js";

/**
 * Generate a 5-question structured quiz for a lesson using Gemini
 * POST /api/quizzes/generate
 */
export const generateQuiz = async (req, res) => {
  try {
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;

    const validatedInput = generateQuizInputSchema.parse({
      ...req.body,
      apiKey,
    });

    const generated = await generateQuizWithGemini({
      lessonTitle: validatedInput.lessonTitle,
      lessonContent: validatedInput.lessonContent,
      currentLevel: validatedInput.currentLevel,
      apiKey,
    });

    res.status(200).json({
      success: true,
      message: "Quiz generated successfully",
      quiz: {
        courseId: validatedInput.courseId,
        moduleIndex: validatedInput.moduleIndex,
        lessonIndex: validatedInput.lessonIndex,
        lessonTitle: validatedInput.lessonTitle,
        currentLevel: validatedInput.currentLevel,
        questions: generated.questions,
      },
    });
  } catch (error) {
    console.error("Error in generateQuiz controller:", error.message);
    const status = error.status || (error.name === "ZodError" ? 400 : 500);
    res.status(status).json({
      success: false,
      message: error.message || "Failed to generate quiz",
      code: error.code || "QUIZ_GENERATION_ERROR",
      errors: error.errors || null,
    });
  }
};

/**
 * Save quiz questions & attempt results to MongoDB
 * POST /api/quizzes/save
 */
export const saveQuiz = async (req, res) => {
  try {
    const validatedData = saveQuizInputSchema.parse(req.body);
    const isDbReady = mongoose.connection.readyState === 1;

    // Check MongoDB availability — never create fake persistence
    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message:
          "MongoDB is currently offline. Quiz results were evaluated successfully, but cannot be persisted to the database. To enable persistence, ensure MongoDB is running or configure MONGO_URI in server/.env.",
        quiz: validatedData,
        dbStatus: getDbStatus(),
      });
    }

    const {
      courseId,
      moduleIndex,
      lessonIndex,
      lessonTitle,
      questions,
      score,
      totalQuestions = 5,
      percentage,
      userAnswers = [],
      weakConcepts = [],
    } = validatedData;

    // Calculate score / percentage if provided or computable
    const calculatedPercentage =
      percentage !== undefined
        ? percentage
        : score !== undefined
        ? Math.round((score / totalQuestions) * 100)
        : 0;

    const attempt = {
      score: score || 0,
      totalQuestions,
      percentage: calculatedPercentage,
      userAnswers,
      weakConcepts,
      completedAt: new Date(),
    };

    // Find existing or create new quiz document
    let quizDoc = await Quiz.findOne({ courseId, moduleIndex, lessonIndex });

    if (!quizDoc) {
      quizDoc = new Quiz({
        courseId,
        moduleIndex,
        lessonIndex,
        lessonTitle,
        questions,
        attempts: [attempt],
        bestScore: score || 0,
      });
    } else {
      quizDoc.lessonTitle = lessonTitle;
      quizDoc.questions = questions;
      quizDoc.attempts.push(attempt);
      if (score !== undefined && score > quizDoc.bestScore) {
        quizDoc.bestScore = score;
      }
    }

    await quizDoc.save();

    res.status(200).json({
      success: true,
      message: "Quiz attempt saved to database",
      quiz: quizDoc,
    });
  } catch (error) {
    console.error("Error in saveQuiz controller:", error.message);
    const status = error.name === "ZodError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to save quiz",
      errors: error.errors || null,
    });
  }
};

/**
 * Retrieve saved quiz for a lesson from MongoDB
 * GET /api/quizzes/:courseId/:moduleIndex/:lessonIndex
 */
export const getLessonQuiz = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message: "MongoDB is offline. Cannot query stored quiz.",
      });
    }

    const { courseId, moduleIndex, lessonIndex } = req.params;

    const quiz = await Quiz.findOne({
      courseId,
      moduleIndex: parseInt(moduleIndex, 10),
      lessonIndex: parseInt(lessonIndex, 10),
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "No saved quiz found for this lesson in database",
      });
    }

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Error in getLessonQuiz controller:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving quiz",
    });
  }
};
