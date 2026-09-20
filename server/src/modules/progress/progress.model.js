import mongoose from "mongoose";

const completedLessonSchema = new mongoose.Schema(
  {
    moduleIndex: {
      type: Number,
      required: true,
    },
    lessonIndex: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
      index: true,
    },
    completedLessons: {
      type: [completedLessonSchema],
      default: [],
    },
    quizAttemptsCount: {
      type: Number,
      default: 0,
    },
    questionsAnswered: {
      type: Number,
      default: 0,
    },
    streak: {
      current: {
        type: Number,
        default: 0,
      },
      lastActiveDate: {
        type: Date,
        default: null,
      },
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure one progress record per user per course
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const UserProgress = mongoose.model("UserProgress", userProgressSchema);
export default UserProgress;
