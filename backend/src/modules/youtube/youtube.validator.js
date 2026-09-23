import { z } from "zod";

export const searchVideosQuerySchema = z
  .object({
    courseTopic: z.string().optional().default(""),
    moduleTitle: z.string().optional().default(""),
    lessonTitle: z.string().optional().default(""),
    learningObjective: z.string().optional().default(""),
    q: z.string().optional().default(""),
    maxResults: z.coerce.number().int().min(1).max(10).default(5),
  })
  .refine(
    (data) => Boolean(data.lessonTitle || data.q || data.courseTopic || data.moduleTitle),
    {
      message: "At least one search term (lessonTitle, q, courseTopic, or moduleTitle) must be provided.",
      path: ["lessonTitle"],
    }
  );
