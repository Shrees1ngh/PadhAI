import mongoose from "mongoose";

const cheatsheetSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      index: true,
    },
    moduleIndex: {
      type: Number,
      index: true,
    },
    lessonIndex: {
      type: Number,
      index: true,
    },
    lessonTitle: {
      type: String,
      required: true,
    },
    sourceType: {
      type: String,
      enum: ["lesson", "study-material"],
      default: "lesson",
    },
    title: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
      default: "",
    },
    keyConcepts: [
      {
        concept: { type: String, default: "" },
        explanation: { type: String, default: "" },
      },
    ],
    definitions: [
      {
        term: { type: String, default: "" },
        definition: { type: String, default: "" },
      },
    ],
    importantRules: [
      {
        type: String,
      },
    ],
    formulas: [
      {
        name: { type: String, default: "" },
        formula: { type: String, default: "" },
        explanation: { type: String, default: "" },
      },
    ],
    syntaxPatterns: [
      {
        title: { type: String, default: "" },
        pattern: { type: String, default: "" },
        explanation: { type: String, default: "" },
      },
    ],
    examples: [
      {
        topic: { type: String, default: "" },
        example: { type: String, default: "" },
        explanation: { type: String, default: "" },
      },
    ],
    commonMistakes: [
      {
        mistake: { type: String, default: "" },
        correction: { type: String, default: "" },
        explanation: { type: String, default: "" },
      },
    ],
    quickRevisionPoints: [
      {
        type: String,
      },
    ],
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
  },
  {
    timestamps: true,
  }
);

// Compound index for lesson lookup
cheatsheetSchema.index(
  { courseId: 1, moduleIndex: 1, lessonIndex: 1 },
  { sparse: true }
);

const Cheatsheet = mongoose.models.Cheatsheet || mongoose.model("Cheatsheet", cheatsheetSchema);

export default Cheatsheet;
