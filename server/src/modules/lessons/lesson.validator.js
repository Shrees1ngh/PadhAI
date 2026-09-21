import { z } from "zod";

export const generateLessonInputSchema = z.object({
  courseId: z.string().optional(),
  courseTitle: z.string().min(1, "Course title is required"),
  courseDescription: z.string().optional().default(""),
  currentLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  learningPreference: z.string().optional().default("Hands-on & Project-based"),
  moduleTitle: z.string().min(1, "Module title is required"),
  moduleDescription: z.string().optional().default(""),
  moduleIndex: z.number().int().min(0),
  totalModules: z.number().int().min(1).optional().default(4),
  lessonTitle: z.string().min(1, "Lesson title is required"),
  learningObjective: z.string().min(1, "Lesson learning objective is required"),
  lessonIndex: z.number().int().min(0),
  previousLessonsContext: z
    .array(
      z.object({
        title: z.string(),
        learningObjective: z.string(),
        keyConcepts: z.array(z.string()).optional(),
      })
    )
    .optional()
    .default([]),
  apiKey: z.string().optional(),
});

export const selfCheckQuestionSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(5, "Answer must be at least 5 characters"),
  hint: z.string().optional(),
  concept: z.string().optional(),
});

export const lessonContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  learningObjective: z.string().min(1, "Learning objective is required"),
  introduction: z.string().min(10, "Introduction must be substantive"),
  explanation: z.string().min(20, "Explanation must be substantive and thorough"),
  keyConcepts: z.array(z.string()).min(1, "At least one key concept is required"),
  examples: z.array(z.string()).min(1, "At least one example or walkthrough is required"),
  realWorldApplication: z.string().min(10, "Real-world application is required"),
  commonMistakes: z.array(z.string()).min(1, "At least one common mistake or misconception is required"),
  summary: z.string().min(10, "Summary is required"),
  importantTakeaways: z.array(z.string()).min(1, "At least one important takeaway is required"),
  selfCheckQuestions: z.array(selfCheckQuestionSchema).optional().default([]),
  estimatedReadingTime: z.string().min(2, "Estimated reading time is required"),
});

export const saveLessonInputSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  moduleIndex: z.number().int().min(0),
  lessonIndex: z.number().int().min(0),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  bloomTaxonomyStage: z.string().optional().default("Remember & Understand"),
  lessonContent: lessonContentSchema,
});
