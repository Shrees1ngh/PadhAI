import { z } from "zod";

export const singleFlashcardSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  concept: z.string().default("Core Concept"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
});

export const generatedFlashcardsSchema = z.object({
  cards: z.array(singleFlashcardSchema).min(1, "At least 1 card is required"),
});

export const generateFlashcardsInputSchema = z.object({
  lessonTitle: z.string().min(1, "Lesson title or source title is required"),
  lessonContent: z.string().min(10, "Source content is required"),
  courseTopic: z.string().optional(),
  currentLevel: z.string().optional().default("Intermediate"),
  courseId: z.string().optional(),
  moduleIndex: z.number().optional(),
  lessonIndex: z.number().optional(),
  sourceType: z.enum(["lesson", "study-material"]).optional().default("lesson"),
  apiKey: z.string().optional(),
});

export const saveFlashcardsInputSchema = z.object({
  courseId: z.string().optional(),
  moduleIndex: z.number().optional(),
  lessonIndex: z.number().optional(),
  lessonTitle: z.string().min(1, "Lesson title is required"),
  sourceType: z.enum(["lesson", "study-material"]).optional().default("lesson"),
  cards: z.array(singleFlashcardSchema).min(1, "Cards array is required"),
});
