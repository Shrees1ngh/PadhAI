import mongoose from "mongoose";
import Topic from "./topic.model.js";
import { generateQuickLearnContentWithGemini } from "../../lib/topic.service.js";
import { getDbStatus } from "../../config/db.js";

/**
 * Generate Quick Learn content for any topic
 * POST /api/topics/quick-learn
 */
export const quickLearnTopic = async (req, res) => {
  try {
    const { topic } = req.body;
    const level = req.body.currentLevel || req.body.level || req.body.learnerLevel || "Beginner";
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: "Topic name is required.",
      });
    }

    const content = await generateQuickLearnContentWithGemini({
      topic: topic.trim(),
      level,
      apiKey,
    });

    res.status(200).json({
      success: true,
      message: "Quick Learn topic generated successfully",
      topic: content,
    });
  } catch (error) {
    console.error("Error in quickLearnTopic:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate quick learn topic",
    });
  }
};

/**
 * Save topic to MongoDB for authenticated user
 * POST /api/topics/save
 */
export const saveTopic = async (req, res) => {
  try {
    const { topic, title, content, visualizationType = "none", progressPercent = 100 } = req.body;
    const level = req.body.currentLevel || req.body.level || req.body.learnerLevel || "Beginner";
    const isDbReady = mongoose.connection.readyState === 1;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to save topic.",
      });
    }

    if (!topic || !content) {
      return res.status(400).json({
        success: false,
        message: "Topic name and learning content are required to save.",
      });
    }

    const userId = req.user.id;
    const userEmail = req.user.email || undefined;

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message: "MongoDB is currently offline. Topic could not be saved to the database. To enable persistence, ensure MongoDB is running or configure MONGO_URI in server/.env.",
        topic: {
          topic,
          title: title || topic,
          level,
          content,
          visualizationType,
          progressPercent,
          createdAt: new Date().toISOString(),
        },
        dbStatus: getDbStatus(),
      });
    }

    const filter = { userId, topic: topic.trim() };

    const saved = await Topic.findOneAndUpdate(
      filter,
      {
        userId,
        userEmail,
        topic: topic.trim(),
        title: title || topic.trim(),
        level,
        content,
        visualizationType,
        progressPercent,
        completed: progressPercent >= 100,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Topic saved successfully to your learning collection",
      topic: saved,
    });
  } catch (error) {
    console.error("Error in saveTopic:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save topic",
    });
  }
};

/**
 * Fetch saved topics for authenticated user
 * GET /api/topics/saved
 */
export const getSavedTopics = async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to fetch saved topics.",
      });
    }

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message: "MongoDB is offline. Cannot query saved topics.",
        topics: [],
      });
    }

    const topics = await Topic.find({ userId: req.user.id }).sort({ updatedAt: -1 }).limit(20);

    res.status(200).json({
      success: true,
      topics,
      count: topics.length,
    });
  } catch (error) {
    console.error("Error in getSavedTopics:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve saved topics",
      topics: [],
    });
  }
};

/**
 * Mark topic as complete / update score for authenticated user
 * PATCH /api/topics/:id/complete
 */
export const completeTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { progressPercent = 100, quizScore = null, completed = true } = req.body;
    const isDbReady = mongoose.connection.readyState === 1;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to update topic progress.",
      });
    }

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message: "MongoDB is offline. Cannot update topic progress.",
      });
    }

    const updated = await Topic.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      {
        progressPercent,
        quizScore,
        completed,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Saved topic not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Topic marked as complete",
      topic: updated,
    });
  } catch (error) {
    console.error("Error in completeTopic:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update topic status",
    });
  }
};
