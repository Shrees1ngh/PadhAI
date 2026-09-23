import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      sparse: true,
    },
    userEmail: {
      type: String,
      sparse: true,
    },
    topic: {
      type: String,
      required: [true, "Topic name is required"],
      trim: true,
      index: true,
    },
    topicKey: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Topic title is required"],
      trim: true,
    },
    domain: {
      type: String,
      default: "general",
      index: true,
    },
    subdomain: {
      type: String,
      default: "general",
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    language: {
      type: String,
      enum: ["english", "hinglish"],
      default: "english",
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    visualizationType: {
      type: String,
      default: "none",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    quizScore: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

topicSchema.index({ userId: 1, topicKey: 1, level: 1, language: 1 });
topicSchema.index({ topic: "text", title: "text" });

const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema);

/**
 * Shared Global Quick Learn Topic Cache Schema (TTL 30 Days)
 */
const topicCacheSchema = new mongoose.Schema(
  {
    topicKey: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    language: {
      type: String,
      required: true,
      enum: ["english", "hinglish"],
      default: "english",
    },
    domain: {
      type: String,
      default: "general",
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

topicCacheSchema.index({ topicKey: 1, level: 1, language: 1 }, { unique: true });
topicCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const TopicCache =
  mongoose.models.TopicCache || mongoose.model("TopicCache", topicCacheSchema);

export default Topic;

