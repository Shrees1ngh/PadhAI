import { z } from "zod";

export const generateQuizInputSchema = z.object({
  courseId: z.string().optional().default("general"),
  moduleIndex: z.number({ coerce: true }).int().min(0).optional().default(0),
  lessonIndex: z.number({ coerce: true }).int().min(0).optional().default(0),
  lessonTitle: z.string().min(1, "Lesson title is required"),
  lessonContent: z
    .union([
      z.string(),
      z.object({
        introduction: z.string().optional(),
        explanation: z.string().optional(),
        keyConcepts: z.array(z.string()).optional(),
        examples: z.array(z.string()).optional(),
        commonMistakes: z.array(z.string()).optional(),
        summary: z.string().optional(),
        importantTakeaways: z.array(z.string()).optional(),
      }),
    ])
    .optional()
    .default({}),
  currentLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  apiKey: z.string().optional(),
});

export const quizQuestionSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  options: z
    .array(z.string().min(1, "Option text cannot be empty"))
    .length(4, "Each question must have exactly 4 options"),
  correctAnswer: z
    .number({ coerce: true })
    .int()
    .min(0, "correctAnswer index must be between 0 and 3")
    .max(3, "correctAnswer index must be between 0 and 3"),
  explanation: z.string().min(5, "Explanation must be provided"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
  relatedConcept: z.string().min(2, "Related concept tag is required"),
});

export const quizOutputSchema = z.object({
  questions: z
    .array(quizQuestionSchema)
    .min(1, "Quiz must contain at least 1 question"),
});

export const saveQuizInputSchema = z.object({
  courseId: z.string().optional().default("general"),
  moduleIndex: z.number({ coerce: true }).int().min(0).optional().default(0),
  lessonIndex: z.number({ coerce: true }).int().min(0).optional().default(0),
  lessonTitle: z.string().min(1, "Lesson title is required"),
  questions: z.array(quizQuestionSchema).min(1, "Quiz must contain questions"),
  score: z.number().min(0).optional(),
  totalQuestions: z.number().default(5),
  percentage: z.number().min(0).max(100).optional(),
  userAnswers: z.array(z.number()).optional(),
  weakConcepts: z.array(z.string()).optional(),
});
