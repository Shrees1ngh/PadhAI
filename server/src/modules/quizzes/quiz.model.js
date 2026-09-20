import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, "4 options are required"],
    validate: [
      (val) => Array.isArray(val) && val.length === 4,
      "Each question must have exactly 4 options",
    ],
  },
  correctAnswer: {
    type: Number,
    required: [true, "Correct answer index (0-3) is required"],
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    required: [true, "Explanation is required"],
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  relatedConcept: {
    type: String,
    required: [true, "Related concept tag is required"],
    trim: true,
  },
});

const quizAttemptSchema = new mongoose.Schema({
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  userAnswers: { type: [Number], default: [] },
  weakConcepts: { type: [String], default: [] },
  completedAt: { type: Date, default: Date.now },
});

const quizSchema = new mongoose.Schema(
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
    lessonTitle: {
      type: String,
      required: true,
    },
    questions: {
      type: [questionSchema],
      validate: [
        (val) => Array.isArray(val) && val.length === 5,
        "A quiz must contain exactly 5 questions",
      ],
    },
    attempts: [quizAttemptSchema],
    bestScore: {
      type: Number,
      default: 0,
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
  { timestamps: true }
);

quizSchema.index({ courseId: 1, moduleIndex: 1, lessonIndex: 1 }, { unique: true });

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
