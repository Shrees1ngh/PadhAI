import mongoose from "mongoose";
import Course from "./course.model.js";
import {
  courseSetupInputSchema,
  modifyOutlineInputSchema,
  saveCourseInputSchema,
} from "./course.validator.js";
import {
  generateCourseOutlineWithGemini,
  modifyCourseOutlineWithGemini,
} from "../../lib/gemini.service.js";
import { getDbStatus } from "../../config/db.js";

/**
 * Step 1: Generate initial structured course outline
 * POST /api/courses/generate-outline
 */
export const generateOutline = async (req, res) => {
  try {
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;

    // Validate user input parameters
    const validatedInput = courseSetupInputSchema.parse({
      ...req.body,
      apiKey,
    });

    const outline = await generateCourseOutlineWithGemini({
      ...validatedInput,
      apiKey,
    });

    res.status(200).json({
      success: true,
      message: "Course outline generated successfully",
      outline,
      setupParams: {
        topic: validatedInput.topic,
        learningGoal: validatedInput.learningGoal,
        currentLevel: validatedInput.currentLevel,
        durationDays: validatedInput.durationDays,
        dailyStudyTime: validatedInput.dailyStudyTime,
        learningPreference: validatedInput.learningPreference,
      },
    });
  } catch (error) {
    console.error("Error in generateOutline:", error.message);
    const status = error.status || (error.name === "ZodError" ? 400 : 500);
    res.status(status).json({
      success: false,
      message: error.message || "Failed to generate course outline",
      code: error.code || "GENERATION_ERROR",
      errors: error.errors || null,
    });
  }
};

/**
 * Step 2: Modify & refine existing outline based on user feedback
 * POST /api/courses/modify-outline
 */
export const modifyOutline = async (req, res) => {
  try {
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;

    const validatedInput = modifyOutlineInputSchema.parse({
      ...req.body,
      apiKey,
    });

    const updatedOutline = await modifyCourseOutlineWithGemini({
      currentOutline: validatedInput.currentOutline,
      modifications: validatedInput.modifications,
      setupParams: validatedInput.setupParams,
      apiKey,
    });

    res.status(200).json({
      success: true,
      message: "Course outline updated successfully",
      outline: updatedOutline,
      setupParams: validatedInput.setupParams,
    });
  } catch (error) {
    console.error("Error in modifyOutline:", error.message);
    const status = error.status || (error.name === "ZodError" ? 400 : 500);
    res.status(status).json({
      success: false,
      message: error.message || "Failed to modify course outline",
      code: error.code || "MODIFICATION_ERROR",
      errors: error.errors || null,
    });
  }
};

/**
 * Step 3: Confirm and save course outline to database
 * POST /api/courses/save
 */
export const saveCourse = async (req, res) => {
  try {
    const validatedData = saveCourseInputSchema.parse(req.body);
    const isDbReady = mongoose.connection.readyState === 1;

    // Check MongoDB availability — never create fake persistence
    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message:
          "MongoDB is currently offline. Your course outline was created successfully, but cannot be persisted to the database. To enable saving, start MongoDB locally or configure MONGO_URI in server/.env.",
        outline: validatedData.outline,
        setupParams: validatedData.setupParams,
        dbStatus: getDbStatus(),
      });
    }

    const newCourse = await Course.create({
      title: validatedData.outline.title,
      description: validatedData.outline.description,
      learningObjectives: validatedData.outline.learningObjectives,
      estimatedDuration: validatedData.outline.estimatedDuration,
      setupParams: validatedData.setupParams,
      modules: validatedData.outline.modules,
      status: "SAVED",
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
    });

    res.status(201).json({
      success: true,
      message: "Course successfully saved to MongoDB",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error in saveCourse:", error.message);
    const status = error.name === "ZodError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to save course",
      errors: error.errors || null,
    });
  }
};

/**
 * List saved courses
 * GET /api/courses
 */
export const getCourses = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!isDbReady) {
      return res.status(200).json({
        success: true,
        mongoUnavailable: true,
        courses: [],
        message: "MongoDB is offline. Showing empty course list.",
      });
    }

    const courses = await Course.find()
      .select("title description estimatedDuration setupParams createdAt modules")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Error in getCourses:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

/**
 * Fetch a single course by ID
 * GET /api/courses/:id
 */
export const getCourseById = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message: "MongoDB is offline. Cannot query course by ID.",
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving course",
    });
  }
};
