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
    title: {
      type: String,
      required: [true, "Topic title is required"],
      trim: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
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

topicSchema.index({ topic: "text", title: "text" });

const Topic = mongoose.model("Topic", topicSchema);
export default Topic;
