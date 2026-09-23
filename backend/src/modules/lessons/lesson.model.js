import mongoose from "mongoose";

const lessonContentSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    moduleIndex: {
      type: Number,
      required: true,
    },
    lessonIndex: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    learningObjective: {
      type: String,
      required: true,
    },
    introduction: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    keyConcepts: {
      type: [String],
      default: [],
    },
    examples: {
      type: [String],
      default: [],
    },
    realWorldApplication: {
      type: String,
      required: true,
    },
    commonMistakes: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      required: true,
    },
    importantTakeaways: {
      type: [String],
      default: [],
    },
    estimatedReadingTime: {
      type: String,
      required: true,
    },
    bloomTaxonomyStage: {
      type: String,
      default: "Remember & Understand",
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

lessonContentSchema.index({ courseId: 1, moduleIndex: 1, lessonIndex: 1 }, { unique: true });

const Lesson = mongoose.model("Lesson", lessonContentSchema);
export default Lesson;
