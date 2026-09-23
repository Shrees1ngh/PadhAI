import mongoose from "mongoose";

const cheatsheetSchema = new mongoose.Schema(
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
    topicKey: {
      type: String,
      required: true,
      index: true,
    },
    lessonTitle: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    domain: {
      type: String,
      default: "general",
      index: true,
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
    // New discriminated union blocks architecture
    blocks: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: [],
    },
    courseId: {
      type: String,
      index: true,
      sparse: true,
    },
    moduleIndex: {
      type: Number,
      index: true,
      sparse: true,
    },
    lessonIndex: {
      type: Number,
      index: true,
      sparse: true,
    },
    sourceType: {
      type: String,
      enum: ["lesson", "study-material", "standalone"],
      default: "standalone",
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    // Backwards-compatibility fields for previously generated cards
    overview: { type: String, default: "" },
    unitNumber: { type: String, default: "" },
    topicDomain: { type: String, default: "" },
    cards: { type: mongoose.Schema.Types.Mixed, default: [] },
    comparisonTable: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound unique index per user, topic, level, and language
cheatsheetSchema.index(
  { userId: 1, topicKey: 1, level: 1, language: 1 },
  { unique: true, sparse: true }
);

// Compound index for course lessons
cheatsheetSchema.index(
  { courseId: 1, moduleIndex: 1, lessonIndex: 1 },
  { sparse: true }
);

export const Cheatsheet =
  mongoose.models.Cheatsheet || mongoose.model("Cheatsheet", cheatsheetSchema);

/**
 * 30-Day Shared Cheatsheet Cache Model
 */
const cheatsheetCacheSchema = new mongoose.Schema(
  {
    topicKey: {
      type: String,
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
      required: true,
    },
    language: {
      type: String,
      enum: ["english", "hinglish"],
      default: "english",
      required: true,
    },
    domain: {
      type: String,
      default: "general",
    },
    cheatsheet: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 30 * 24 * 60 * 60, // 30 days in seconds
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index for shared cache lookups
cheatsheetCacheSchema.index(
  { topicKey: 1, level: 1, language: 1 },
  { unique: true }
);

export const CheatsheetCache =
  mongoose.models.CheatsheetCache ||
  mongoose.model("CheatsheetCache", cheatsheetCacheSchema);

export default Cheatsheet;
