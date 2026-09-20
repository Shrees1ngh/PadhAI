import mongoose from "mongoose";
import Cheatsheet from "./cheatsheet.model.js";
import {
  generateCheatsheetInputSchema,
  saveCheatsheetInputSchema,
} from "./cheatsheet.validator.js";
import { generateCheatsheetWithGemini } from "../../lib/cheatsheet.service.js";
import { getDbStatus } from "../../config/db.js";

/**
 * Generate a high-yield revision cheatsheet using Gemini
 * POST /api/cheatsheets/generate
 */
export const generateCheatsheetHandler = async (req, res) => {
  try {
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;

    const validatedInput = generateCheatsheetInputSchema.parse({
      ...req.body,
      apiKey,
    });

    const cheatsheetData = await generateCheatsheetWithGemini({
      lessonTitle: validatedInput.lessonTitle,
      lessonContent: validatedInput.lessonContent,
      courseTopic: validatedInput.courseTopic,
      currentLevel: validatedInput.currentLevel,
      apiKey,
    });

    res.status(200).json({
      success: true,
      message: "Cheatsheet generated successfully",
      cheatsheet: cheatsheetData,
      metadata: {
        courseId: validatedInput.courseId,
        moduleIndex: validatedInput.moduleIndex,
        lessonIndex: validatedInput.lessonIndex,
        lessonTitle: validatedInput.lessonTitle,
        sourceType: validatedInput.sourceType,
        currentLevel: validatedInput.currentLevel,
      },
    });
  } catch (error) {
    console.error("Error in generateCheatsheetHandler:", error.message);
    const status = error.status || (error.name === "ZodError" ? 400 : 500);
    res.status(status).json({
      success: false,
      message: error.message || "Failed to generate cheatsheet",
      code: error.code || "CHEATSHEET_GENERATION_ERROR",
      errors: error.errors || null,
    });
  }
};

/**
 * Save a cheatsheet to MongoDB
 * POST /api/cheatsheets/save
 */
export const saveCheatsheetHandler = async (req, res) => {
  try {
    const validatedInput = saveCheatsheetInputSchema.parse(req.body);
    const isDbReady = mongoose.connection.readyState === 1;

    // Check MongoDB availability — never create fake persistence
    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message:
          "MongoDB is currently offline. Cheatsheet was generated successfully, but cannot be persisted to the database. To enable persistence, ensure MongoDB is running or configure MONGO_URI in server/.env.",
        cheatsheet: validatedInput.cheatsheet,
        dbStatus: getDbStatus(),
      });
    }

    const {
      courseId,
      moduleIndex,
      lessonIndex,
      lessonTitle,
      sourceType,
      cheatsheet,
    } = validatedInput;

    const query = courseId
      ? { courseId, moduleIndex, lessonIndex }
      : { lessonTitle, sourceType };

    let doc = await Cheatsheet.findOne(query);

    if (!doc) {
      doc = new Cheatsheet({
        courseId,
        moduleIndex,
        lessonIndex,
        lessonTitle,
        sourceType,
        title: cheatsheet.title || lessonTitle,
        overview: cheatsheet.overview,
        keyConcepts: cheatsheet.keyConcepts,
        definitions: cheatsheet.definitions,
        importantRules: cheatsheet.importantRules,
        formulas: cheatsheet.formulas,
        syntaxPatterns: cheatsheet.syntaxPatterns,
        examples: cheatsheet.examples,
        commonMistakes: cheatsheet.commonMistakes,
        quickRevisionPoints: cheatsheet.quickRevisionPoints,
        userId: req.user?.id || null,
        userEmail: req.user?.email || null,
      });
    } else {
      doc.title = cheatsheet.title || lessonTitle;
      doc.overview = cheatsheet.overview;
      doc.keyConcepts = cheatsheet.keyConcepts;
      doc.definitions = cheatsheet.definitions;
      doc.importantRules = cheatsheet.importantRules;
      doc.formulas = cheatsheet.formulas;
      doc.syntaxPatterns = cheatsheet.syntaxPatterns;
      doc.examples = cheatsheet.examples;
      doc.commonMistakes = cheatsheet.commonMistakes;
      doc.quickRevisionPoints = cheatsheet.quickRevisionPoints;
      if (req.user?.id) {
        doc.userId = req.user.id;
        doc.userEmail = req.user.email;
      }
    }

    await doc.save();

    res.status(200).json({
      success: true,
      message: "Cheatsheet saved to database",
      cheatsheet: doc,
    });
  } catch (error) {
    console.error("Error in saveCheatsheetHandler:", error.message);
    const status = error.name === "ZodError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to save cheatsheet",
      errors: error.errors || null,
    });
  }
};

/**
 * Retrieve saved cheatsheet for a lesson from MongoDB
 * GET /api/cheatsheets/:courseId/:moduleIndex/:lessonIndex
 */
export const getLessonCheatsheetHandler = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message: "MongoDB is offline. Cannot query stored cheatsheet.",
      });
    }

    const { courseId, moduleIndex, lessonIndex } = req.params;

    const doc = await Cheatsheet.findOne({
      courseId,
      moduleIndex: parseInt(moduleIndex, 10),
      lessonIndex: parseInt(lessonIndex, 10),
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "No saved cheatsheet found for this lesson in database",
      });
    }

    res.status(200).json({
      success: true,
      cheatsheet: doc,
    });
  } catch (error) {
    console.error("Error in getLessonCheatsheetHandler:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving cheatsheet",
    });
  }
};
