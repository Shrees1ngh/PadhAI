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
    unitNumber: {
      type: String,
      default: "UNIT REVISION",
    },
    topicDomain: {
      type: String,
      default: "general",
    },
    cards: [
      {
        number: { type: mongoose.Schema.Types.Mixed, default: 1 },
        title: { type: String, default: "" },
        definition: { type: String, default: "" },
        bulletPoints: [{ type: String }],
        formula: { type: String, default: "" },
        codeSnippet: { type: String, default: "" },
        codeLanguage: { type: String, default: "" },
        example: { type: String, default: "" },
        visualDiagram: { type: String, default: "" },
        examTip: { type: String, default: "" },
        categoryType: { type: String, default: "Concept" },
        badgeColor: { type: String, default: "indigo" },
      },
    ],
    comparisonTable: {
      title: { type: String, default: "" },
      headers: [{ type: String }],
      rows: [
        {
          type: { type: String, default: "" },
          definition: { type: String, default: "" },
          example: { type: String, default: "" },
          use: { type: String, default: "" },
          badgeColor: { type: String, default: "indigo" },
        },
      ],
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
    examPoints: [
      {
        type: String,
      },
    ],
    topperTip: {
      type: String,
      default: "",
    },
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
