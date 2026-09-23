import mongoose from "mongoose";

const singleFlashcardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  concept: {
    type: String,
    default: "Core Concept",
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
});

const flashcardDeckSchema = new mongoose.Schema(
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
    cards: [singleFlashcardSchema],
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

flashcardDeckSchema.index(
  { courseId: 1, moduleIndex: 1, lessonIndex: 1 },
  { sparse: true }
);

const FlashcardDeck =
  mongoose.models.FlashcardDeck ||
  mongoose.model("FlashcardDeck", flashcardDeckSchema);

export default FlashcardDeck;
