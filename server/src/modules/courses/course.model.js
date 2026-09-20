import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Lesson title is required"],
    trim: true,
  },
  learningObjective: {
    type: String,
    required: [true, "Lesson learning objective is required"],
    trim: true,
  },
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Module title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Module description is required"],
    trim: true,
  },
  estimatedMinutes: {
    type: Number,
    required: [true, "Estimated minutes are required"],
  },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    learningObjectives: {
      type: [String],
      required: [true, "Learning objectives are required"],
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        "At least one learning objective is required",
      ],
    },
    estimatedDuration: {
      type: String,
      required: [true, "Estimated duration is required"],
    },
    setupParams: {
      topic: { type: String, required: true },
      learningGoal: { type: String, required: true },
      currentLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true,
      },
      durationDays: { type: Number, required: true },
      dailyStudyTime: { type: String, required: true },
      learningPreference: { type: String, required: true },
    },
    modules: {
      type: [moduleSchema],
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        "Course must have at least one module",
      ],
    },
    status: {
      type: String,
      enum: ["OUTLINE_GENERATED", "SAVED"],
      default: "SAVED",
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

courseSchema.index({ "setupParams.topic": "text", title: "text" });

const Course = mongoose.model("Course", courseSchema);
export default Course;
