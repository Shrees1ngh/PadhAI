import mongoose from "mongoose";
import Topic, { TopicCache } from "./topic.model.js";
import { generateQuickLearnContentWithGemini } from "../../lib/topic.service.js";
import { getDbStatus } from "../../config/db.js";

/**
 * Generate Quick Learn content for any topic with 30-day cache support
 * POST /api/topics/quick-learn
 */
export const quickLearnTopic = async (req, res) => {
  try {
    const { topic } = req.body;
    const level = req.body.currentLevel || req.body.level || req.body.learnerLevel || "Beginner";
    const language = (req.body.language || "english").toLowerCase() === "hinglish" ? "hinglish" : "english";
    const regenerate = Boolean(req.body.regenerate);
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: "Topic name is required.",
      });
    }

    const trimmedTopic = topic.trim();
    const topicKey = trimmedTopic.toLowerCase();
    const isDbReady = mongoose.connection.readyState === 1;

    // Check shared 30-day TTL cache unless regenerate is requested
    if (!regenerate && isDbReady) {
      try {
        const cachedEntry = await TopicCache.findOne({
          topicKey,
          level,
          language,
        });

        if (cachedEntry && cachedEntry.content) {
          return res.status(200).json({
            success: true,
            cached: true,
            message: "Quick Learn topic retrieved from cache",
            topic: cachedEntry.content,
          });
        }
      } catch (cacheReadErr) {
        console.warn("Topic cache read error (continuing with live generator):", cacheReadErr.message);
      }
    }

    const content = await generateQuickLearnContentWithGemini({
      topic: trimmedTopic,
      level,
      language,
      apiKey,
    });

    // Save to shared 30-day cache if DB is connected and not demo
    if (isDbReady && !content.isDemo) {
      try {
        await TopicCache.findOneAndUpdate(
          { topicKey, level, language },
          {
            topicKey,
            topic: trimmedTopic,
            level,
            language,
            domain: content.domain || "general",
            content,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (cacheSaveErr) {
        console.warn("Topic cache save warning:", cacheSaveErr.message);
      }
    }

    res.status(200).json({
      success: true,
      cached: false,
      message: "Quick Learn topic generated successfully",
      topic: content,
    });
  } catch (error) {
    console.error("Error in quickLearnTopic:", error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      code: error.code || "TOPIC_GENERATION_FAILED",
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
    const language = (req.body.language || content?.language || "english").toLowerCase() === "hinglish" ? "hinglish" : "english";
    const isDbReady = mongoose.connection.readyState === 1;

    if (req.body.isDemo || content?.isDemo) {
      return res.status(400).json({
        success: false,
        code: "DEMO_SAVE_DISABLED",
        message: "Demo content cannot be saved to the database.",
      });
    }

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
    const trimmedTopic = topic.trim();
    const topicKey = trimmedTopic.toLowerCase();

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        mongoUnavailable: true,
        message:
          "MongoDB is currently offline. Topic could not be saved to the database. To enable persistence, ensure MongoDB is running or configure MONGO_URI in server/.env.",
        topic: {
          topic: trimmedTopic,
          topicKey,
          title: title || trimmedTopic,
          domain: content.domain || "general",
          subdomain: content.subdomain || "general",
          level,
          language,
          content,
          visualizationType,
          progressPercent,
          createdAt: new Date().toISOString(),
        },
        dbStatus: getDbStatus(),
      });
    }

    const filter = { userId, topicKey, level, language };

    const saved = await Topic.findOneAndUpdate(
      filter,
      {
        userId,
        userEmail,
        topic: trimmedTopic,
        topicKey,
        title: title || trimmedTopic,
        domain: content.domain || "general",
        subdomain: content.subdomain || "general",
        level,
        language,
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

    const topics = await Topic.find({ userId: req.user.id }).sort({ updatedAt: -1 }).limit(30);

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
 * Delete a saved topic
 * DELETE /api/topics/:id
 */
export const deleteSavedTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbReady = mongoose.connection.readyState === 1;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to delete topic.",
      });
    }

    if (!isDbReady) {
      return res.status(503).json({
        success: false,
        message: "Database is offline.",
      });
    }

    const deleted = await Topic.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Saved topic not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Topic removed from collection.",
    });
  } catch (error) {
    console.error("Error in deleteSavedTopic:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete saved topic.",
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
