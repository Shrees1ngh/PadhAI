import mongoose from "mongoose";
import Cheatsheet, { CheatsheetCache } from "./cheatsheet.model.js";
import {
  generateCheatsheetInputSchema,
  saveCheatsheetInputSchema,
} from "./cheatsheet.validator.js";
import { generateCheatsheetWithGemini } from "../../lib/cheatsheet.service.js";
import { getDbStatus } from "../../config/db.js";

/**
 * Generate a high-yield domain-adaptive revision cheatsheet
 * POST /api/cheatsheets/generate
 */
export const generateCheatsheetHandler = async (req, res) => {
  try {
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;

    const validatedInput = generateCheatsheetInputSchema.parse({
      ...req.body,
      apiKey,
    });

    const rawTopic = validatedInput.topic || validatedInput.lessonTitle;
    const topicKey = rawTopic.toLowerCase().trim();
    const level = validatedInput.currentLevel || "Beginner";
    const language = validatedInput.language || "english";
    const isDbReady = mongoose.connection.readyState === 1;

    // 1. Shared Cache Lookup (30-day TTL) unless regenerate is explicitly requested
    if (!validatedInput.regenerate && isDbReady && apiKey !== "DEMO_MODE") {
      try {
        const cached = await CheatsheetCache.findOne({
          topicKey,
          level,
          language,
        });

        if (cached && cached.cheatsheet) {
          return res.status(200).json({
            success: true,
            message: "Cheatsheet loaded from shared cache",
            cheatsheet: cached.cheatsheet,
            cached: true,
            metadata: {
              courseId: validatedInput.courseId,
              moduleIndex: validatedInput.moduleIndex,
              lessonIndex: validatedInput.lessonIndex,
              lessonTitle: rawTopic,
              sourceType: validatedInput.sourceType,
              currentLevel: level,
              language,
              domain: cached.domain || cached.cheatsheet?.domain || "general",
            },
          });
        }
      } catch (cacheErr) {
        console.warn("Shared cheatsheet cache lookup warning:", cacheErr.message);
      }
    }

    // 2. Generate with Gemini
    const cheatsheetData = await generateCheatsheetWithGemini({
      topic: rawTopic,
      lessonTitle: rawTopic,
      lessonContent: validatedInput.lessonContent,
      courseTopic: validatedInput.courseTopic,
      currentLevel: level,
      language,
      apiKey,
    });

    // 3. Populate shared cache asynchronously
    if (isDbReady && !cheatsheetData.isDemo && apiKey !== "DEMO_MODE") {
      CheatsheetCache.findOneAndUpdate(
        { topicKey, level, language },
        {
          topicKey,
          level,
          language,
          domain: cheatsheetData.domain || "general",
          cheatsheet: cheatsheetData,
          createdAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).catch((err) => console.warn("Failed to update cheatsheet cache:", err.message));
    }

    res.status(200).json({
      success: true,
      message: "Cheatsheet generated successfully",
      cheatsheet: cheatsheetData,
      cached: false,
      metadata: {
        courseId: validatedInput.courseId,
        moduleIndex: validatedInput.moduleIndex,
        lessonIndex: validatedInput.lessonIndex,
        lessonTitle: rawTopic,
        sourceType: validatedInput.sourceType,
        currentLevel: level,
        language,
        domain: cheatsheetData.domain || "general",
      },
    });
  } catch (error) {
    console.error("Error in generateCheatsheetHandler:", error.message);
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    const status = error.status || (isZod ? 400 : 500);
    res.status(status).json({
      success: false,
      message: isZod
        ? issues[0]?.message || "Invalid input parameters"
        : error.message || "Failed to generate cheatsheet",
      code: error.code || (isZod ? "VALIDATION_ERROR" : "CHEATSHEET_GENERATION_ERROR"),
      errors: issues.length ? issues : null,
    });
  }
};

/**
 * Save a cheatsheet to MongoDB for authenticated user
 * POST /api/cheatsheets/save
 */
export const saveCheatsheetHandler = async (req, res) => {
  try {
    const validatedInput = saveCheatsheetInputSchema.parse(req.body);
    const isDbReady = mongoose.connection.readyState === 1;

    if (req.body.isDemo || validatedInput.isDemo || validatedInput.cheatsheet?.isDemo) {
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

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message:
          "MongoDB is currently offline. Cheatsheet was generated successfully, but cannot be persisted.",
        cheatsheet: validatedInput.cheatsheet,
        dbStatus: getDbStatus(),
      });
    }

    const rawTopic = validatedInput.topic || validatedInput.lessonTitle;
    const topicKey = rawTopic.toLowerCase().trim();
    const level = validatedInput.currentLevel || validatedInput.cheatsheet?.level || "Beginner";
    const language = validatedInput.language || validatedInput.cheatsheet?.language || "english";
    const domain = validatedInput.domain || validatedInput.cheatsheet?.domain || "general";
    const blocks = validatedInput.cheatsheet?.blocks || [];

    const cheatsheetDoc = await Cheatsheet.findOneAndUpdate(
      {
        userId: req.user.id,
        topicKey,
        level,
        language,
      },
      {
        userId: req.user.id,
        userEmail: req.user.email || "",
        topicKey,
        lessonTitle: rawTopic,
        title: validatedInput.cheatsheet?.title || rawTopic,
        subtitle: validatedInput.cheatsheet?.subtitle || "",
        domain,
        level,
        language,
        blocks,
        courseId: validatedInput.courseId || "",
        moduleIndex: validatedInput.moduleIndex || 0,
        lessonIndex: validatedInput.lessonIndex || 0,
        sourceType: validatedInput.sourceType || "standalone",
        isDemo: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Cheatsheet saved successfully to your collection",
      cheatsheetId: cheatsheetDoc._id,
      cheatsheet: cheatsheetDoc,
    });
  } catch (error) {
    console.error("Error in saveCheatsheetHandler:", error.message);
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    res.status(isZod ? 400 : 500).json({
      success: false,
      message: isZod
        ? issues[0]?.message || "Invalid cheatsheet save data"
        : error.message || "Failed to save cheatsheet",
      code: isZod ? "VALIDATION_ERROR" : "CHEATSHEET_SAVE_ERROR",
      errors: issues.length ? issues : null,
    });
  }
};

/**
 * Retrieve all saved cheatsheets for authenticated user
 * GET /api/cheatsheets/mine (and GET /api/cheatsheets/saved)
 */
export const getSavedCheatsheetsHandler = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to fetch your cheatsheets.",
      });
    }

    if (!isDbReady) {
      return res.status(200).json({
        success: true,
        cheatsheets: [],
        mongoUnavailable: true,
        message: "Database is currently offline. Saved cheatsheets are unavailable.",
      });
    }

    const cheatsheets = await Cheatsheet.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      cheatsheets,
      count: cheatsheets.length,
    });
  } catch (error) {
    console.error("Error in getSavedCheatsheetsHandler:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve saved cheatsheets.",
    });
  }
};

/**
 * Delete a saved cheatsheet by ID
 * DELETE /api/cheatsheets/:id
 */
export const deleteCheatsheetHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbReady = mongoose.connection.readyState === 1;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to delete cheatsheet.",
      });
    }

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        message: "Database is currently offline.",
      });
    }

    const deleted = await Cheatsheet.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Cheatsheet not found or you do not have permission to delete it.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cheatsheet deleted successfully.",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error in deleteCheatsheetHandler:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete cheatsheet.",
    });
  }
};

/**
 * Retrieve cheatsheet for specific course lesson
 * GET /api/cheatsheets/:courseId/:moduleIndex/:lessonIndex
 */
export const getLessonCheatsheetHandler = async (req, res) => {
  try {
    const { courseId, moduleIndex, lessonIndex } = req.params;
    const isDbReady = mongoose.connection.readyState === 1;

    if (!isDbReady) {
      return res.status(404).json({
        success: false,
        message: "No persisted cheatsheet found (database offline).",
      });
    }

    const cheatsheet = await Cheatsheet.findOne({
      userId: req.user.id,
      courseId,
      moduleIndex: Number(moduleIndex),
      lessonIndex: Number(lessonIndex),
    });

    if (!cheatsheet) {
      return res.status(404).json({
        success: false,
        message: "No saved cheatsheet found for this lesson.",
      });
    }

    res.status(200).json({
      success: true,
      cheatsheet,
    });
  } catch (error) {
    console.error("Error in getLessonCheatsheetHandler:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lesson cheatsheet.",
    });
  }
};
