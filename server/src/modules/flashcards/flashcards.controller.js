import mongoose from "mongoose";
import FlashcardDeck from "./flashcard.model.js";
import {
  generateFlashcardsInputSchema,
  saveFlashcardsInputSchema,
} from "./flashcard.validator.js";
import { generateFlashcardsWithGemini } from "../../lib/flashcard.service.js";
import { getDbStatus } from "../../config/db.js";

/**
 * Generate 10 structured flashcards for a lesson or study material using Gemini
 * POST /api/flashcards/generate
 */
export const generateFlashcardsHandler = async (req, res) => {
  try {
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;

    const validatedInput = generateFlashcardsInputSchema.parse({
      ...req.body,
      apiKey,
    });

    const generated = await generateFlashcardsWithGemini({
      lessonTitle: validatedInput.lessonTitle,
      lessonContent: validatedInput.lessonContent,
      courseTopic: validatedInput.courseTopic,
      currentLevel: validatedInput.currentLevel,
      apiKey,
    });

    res.status(200).json({
      success: true,
      message: "Flashcards generated successfully",
      deck: {
        courseId: validatedInput.courseId,
        moduleIndex: validatedInput.moduleIndex,
        lessonIndex: validatedInput.lessonIndex,
        lessonTitle: validatedInput.lessonTitle,
        sourceType: validatedInput.sourceType,
        cards: generated.cards,
      },
    });
  } catch (error) {
    console.error("Error in generateFlashcardsHandler:", error.message);
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    const status = error.status || (isZod ? 400 : 500);
    res.status(status).json({
      success: false,
      message: isZod ? (issues[0]?.message || "Invalid input") : (error.message || "Failed to generate flashcards"),
      code: error.code || (isZod ? "VALIDATION_ERROR" : "FLASHCARDS_GENERATION_ERROR"),
      errors: issues.length ? issues : null,
    });
  }
};

/**
 * Save flashcards deck to MongoDB
 * POST /api/flashcards/save
 */
export const saveFlashcardsHandler = async (req, res) => {
  try {
    const validatedInput = saveFlashcardsInputSchema.parse(req.body);
    const isDbReady = mongoose.connection.readyState === 1;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to save flashcard deck.",
      });
    }

    // Check MongoDB availability — never create fake persistence
    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message:
          "MongoDB is currently offline. Flashcards were generated successfully, but cannot be persisted to the database. To enable persistence, ensure MongoDB is running or configure MONGO_URI in server/.env.",
        deck: validatedInput,
        dbStatus: getDbStatus(),
      });
    }

    const { courseId, moduleIndex, lessonIndex, lessonTitle, sourceType, cards } =
      validatedInput;

    const query = courseId
      ? { courseId, moduleIndex, lessonIndex, userId: req.user.id }
      : { lessonTitle, sourceType, userId: req.user.id };

    let doc = await FlashcardDeck.findOne(query);

    if (!doc) {
      doc = new FlashcardDeck({
        courseId,
        moduleIndex,
        lessonIndex,
        lessonTitle,
        sourceType,
        cards,
        userId: req.user.id,
        userEmail: req.user.email || null,
      });
    } else {
      doc.lessonTitle = lessonTitle;
      doc.cards = cards;
      doc.userId = req.user.id;
      doc.userEmail = req.user.email || null;
    }

    await doc.save();

    res.status(200).json({
      success: true,
      message: "Flashcard deck saved to database",
      deck: doc,
    });
  } catch (error) {
    console.error("Error in saveFlashcardsHandler:", error.message);
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    const status = isZod ? 400 : (error.status || 500);
    res.status(status).json({
      success: false,
      message: isZod ? (issues[0]?.message || "Invalid input for saving flashcards") : (error.message || "Failed to save flashcards deck"),
      errors: issues.length ? issues : null,
    });
  }
};

/**
 * Retrieve saved flashcards for a lesson from MongoDB
 * GET /api/flashcards/:courseId/:moduleIndex/:lessonIndex
 */
export const getLessonFlashcardsHandler = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to view flashcards.",
      });
    }

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message: "MongoDB is offline. Cannot query stored flashcards.",
      });
    }

    const { courseId, moduleIndex, lessonIndex } = req.params;

    const deck = await FlashcardDeck.findOne({
      courseId,
      moduleIndex: parseInt(moduleIndex, 10),
      lessonIndex: parseInt(lessonIndex, 10),
      userId: req.user.id,
    });

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: "No saved flashcards found for this lesson in database",
      });
    }

    res.status(200).json({
      success: true,
      deck,
    });
  } catch (error) {
    console.error("Error in getLessonFlashcardsHandler:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving flashcards",
    });
  }
};
