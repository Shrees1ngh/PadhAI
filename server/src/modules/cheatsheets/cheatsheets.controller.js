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
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    const status = error.status || (isZod ? 400 : 500);
    res.status(status).json({
      success: false,
      message: isZod ? (issues[0]?.message || "Invalid input") : (error.message || "Failed to generate cheatsheet"),
      code: error.code || (isZod ? "VALIDATION_ERROR" : "CHEATSHEET_GENERATION_ERROR"),
      errors: issues.length ? issues : null,
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

    if (req.body.isDemo || validatedInput.cheatsheet?.isDemo) {
      return res.status(400).json({
        success: false,
        code: "DEMO_SAVE_DISABLED",
        message: "Demo content cannot be saved to the database.",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to save cheatsheet.",
      });
    }

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
      ? { courseId, moduleIndex, lessonIndex, userId: req.user.id }
      : { lessonTitle, sourceType, userId: req.user.id };

    let doc = await Cheatsheet.findOne(query);

    const cheatsheetPayload = {
      courseId,
      moduleIndex,
      lessonIndex,
      lessonTitle,
      sourceType,
      title: cheatsheet.title || lessonTitle,
      subtitle: cheatsheet.subtitle || "",
      overview: cheatsheet.overview || "",
      unitNumber: cheatsheet.unitNumber || "UNIT REVISION",
      topicDomain: cheatsheet.topicDomain || "general",
      cards: cheatsheet.cards || [],
      comparisonTable: cheatsheet.comparisonTable || { title: "", headers: [], rows: [] },
      keyConcepts: cheatsheet.keyConcepts || [],
      definitions: cheatsheet.definitions || [],
      importantRules: cheatsheet.importantRules || [],
      formulas: cheatsheet.formulas || [],
      syntaxPatterns: cheatsheet.syntaxPatterns || [],
      examples: cheatsheet.examples || [],
      commonMistakes: cheatsheet.commonMistakes || [],
      quickRevisionPoints: cheatsheet.quickRevisionPoints || [],
      examPoints: cheatsheet.examPoints || [],
      topperTip: cheatsheet.topperTip || "",
      userId: req.user.id,
      userEmail: req.user.email || null,
    };

    if (!doc) {
      doc = new Cheatsheet(cheatsheetPayload);
    } else {
      Object.assign(doc, cheatsheetPayload);
    }

    await doc.save();

    res.status(200).json({
      success: true,
      message: "Cheatsheet saved to database",
      cheatsheet: doc,
    });
  } catch (error) {
    console.error("Error in saveCheatsheetHandler:", error.message);
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    const status = isZod ? 400 : (error.status || 500);
    res.status(status).json({
      success: false,
      message: isZod ? (issues[0]?.message || "Invalid input for saving cheatsheet") : (error.message || "Failed to save cheatsheet"),
      errors: issues.length ? issues : null,
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

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to view cheatsheet.",
      });
    }

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
      userId: req.user.id,
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
