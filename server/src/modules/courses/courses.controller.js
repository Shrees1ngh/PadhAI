import mongoose from "mongoose";
import Course from "./course.model.js";
import {
  courseSetupInputSchema,
  modifyOutlineInputSchema,
  saveCourseInputSchema,
  normalizeCourseOutline,
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
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    const status = error.status || (isZod ? 400 : 500);
    res.status(status).json({
      success: false,
      message: isZod ? (issues[0]?.message || "Invalid input") : (error.message || "Failed to generate course outline"),
      code: error.code || (isZod ? "VALIDATION_ERROR" : "GENERATION_ERROR"),
      errors: issues.length ? issues : null,
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
      modifications: req.body.modifications || req.body.instruction,
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
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    const status = error.status || (isZod ? 400 : 500);
    res.status(status).json({
      success: false,
      message: isZod ? (issues[0]?.message || "Invalid input") : (error.message || "Failed to modify course outline"),
      code: error.code || (isZod ? "VALIDATION_ERROR" : "MODIFICATION_ERROR"),
      errors: issues.length ? issues : null,
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

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to save courses.",
      });
    }

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

    const normalizedOutline = normalizeCourseOutline(
      validatedData.outline,
      validatedData.setupParams?.durationDays || validatedData.outline.durationDays || 10
    );

    const newCourse = await Course.create({
      title: normalizedOutline.title,
      description: normalizedOutline.description,
      learningObjectives: normalizedOutline.learningObjectives,
      estimatedDuration: normalizedOutline.estimatedDuration,
      durationDays: normalizedOutline.durationDays,
      category: validatedData.setupParams?.category || "Programming & Computer Science",
      includeVideos: validatedData.setupParams?.includeVideos !== false,
      bannerGradient: validatedData.setupParams?.bannerGradient || "from-indigo-600 via-purple-600 to-cyan-500",
      days: normalizedOutline.days,
      setupParams: validatedData.setupParams,
      modules: normalizedOutline.modules,
      status: "SAVED",
      userId: req.user.id,
      userEmail: req.user.email || null,
    });

    res.status(201).json({
      success: true,
      message: "Course successfully saved to MongoDB",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error in saveCourse:", error.message);
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    const status = isZod ? 400 : (error.status || 500);
    res.status(status).json({
      success: false,
      message: isZod ? (issues[0]?.message || "Invalid input for saving course") : (error.message || "Failed to save course"),
      errors: issues.length ? issues : null,
    });
  }
};

/**
 * List saved courses belonging exclusively to the authenticated user
 * GET /api/courses
 */
export const getCourses = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to fetch courses.",
      });
    }

    if (!isDbReady) {
      return res.status(200).json({
        success: true,
        mongoUnavailable: true,
        courses: [],
        message: "MongoDB is offline. Showing empty course list.",
      });
    }

    const rawCourses = await Course.find({ userId: req.user.id })
      .select("title description estimatedDuration durationDays days setupParams createdAt modules")
      .sort({ createdAt: -1 })
      .lean();

    const courses = rawCourses.map((c) => {
      if (!c.days || c.days.length === 0) {
        return normalizeCourseOutline(c, c.setupParams?.durationDays || c.durationDays || 10);
      }
      return c;
    });

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
 * Fetch a single course by ID, ensuring it belongs to the authenticated user
 * GET /api/courses/:id
 */
export const getCourseById = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to view course.",
      });
    }

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message: "MongoDB is offline. Cannot query course by ID.",
      });
    }

    // Strictly check ownership matching userId
    const rawCourse = await Course.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!rawCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const course = (!rawCourse.days || rawCourse.days.length === 0)
      ? normalizeCourseOutline(rawCourse, rawCourse.setupParams?.durationDays || rawCourse.durationDays || 10)
      : rawCourse;

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
