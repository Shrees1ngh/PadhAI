import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "model", "system"]).default("user"),
  content: z.string().min(1, "Message content cannot be empty"),
});

export const tutorChatInputSchema = z.object({
  message: z.string().min(1, "User query is required"),
  courseTitle: z.string().optional().default(""),
  moduleTitle: z.string().optional().default(""),
  lessonTitle: z.string().optional().default(""),
  learningObjective: z.string().optional().default(""),
  lessonContent: z.union([z.string(), z.record(z.any())]).optional().default({}),
  learnerLevel: z.string().optional().default("Beginner"),
  conversationHistory: z.array(chatMessageSchema).optional().default([]),
  apiKey: z.string().optional(),
});

export const tutorChatOutputSchema = z.object({
  answer: z.string().min(1, "Tutor answer is required"),
  relatedConcepts: z.array(z.string()).optional().default([]),
  suggestedFollowUps: z.array(z.string()).optional().default([]),
  isOutsideLessonScope: z.boolean().optional().default(false),
});
