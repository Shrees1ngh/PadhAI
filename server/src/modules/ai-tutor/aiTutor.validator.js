import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "model", "system"]),
  content: z.string().min(1, "Message content cannot be empty"),
});

export const tutorChatInputSchema = z.object({
  message: z.string().min(1, "User query is required"),
  courseTitle: z.string().optional().default(""),
  moduleTitle: z.string().optional().default(""),
  lessonTitle: z.string().optional().default(""),
  learningObjective: z.string().optional().default(""),
  lessonContent: z
    .object({
      introduction: z.string().optional(),
      explanation: z.string().optional(),
      keyConcepts: z.array(z.string()).optional(),
      examples: z.array(z.string()).optional(),
      realWorldApplication: z.string().optional(),
      commonMistakes: z.array(z.string()).optional(),
      summary: z.string().optional(),
      importantTakeaways: z.array(z.string()).optional(),
    })
    .optional()
    .default({}),
  learnerLevel: z
    .enum(["Beginner", "Intermediate", "Advanced"])
    .optional()
    .default("Beginner"),
  conversationHistory: z.array(chatMessageSchema).optional().default([]),
  apiKey: z.string().optional(),
});

export const tutorChatOutputSchema = z.object({
  answer: z.string().min(1, "Tutor answer is required"),
  relatedConcepts: z.array(z.string()).optional().default([]),
  suggestedFollowUps: z.array(z.string()).optional().default([]),
  isOutsideLessonScope: z.boolean().optional().default(false),
});
