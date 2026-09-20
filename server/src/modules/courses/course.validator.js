import { z } from "zod";

export const courseSetupInputSchema = z.object({
  topic: z
    .string()
    .min(2, "Topic must be at least 2 characters")
    .max(150, "Topic must be under 150 characters"),
  learningGoal: z
    .string()
    .min(5, "Learning goal must be at least 5 characters")
    .max(300, "Learning goal must be under 300 characters"),
  currentLevel: z.enum(["Beginner", "Intermediate", "Advanced"], {
    errorMap: () => ({ message: "Level must be Beginner, Intermediate, or Advanced" }),
  }),
  durationDays: z
    .number({ coerce: true })
    .int()
    .min(1, "Duration must be at least 1 day")
    .max(180, "Duration cannot exceed 180 days"),
  dailyStudyTime: z
    .string()
    .min(2, "Daily study time is required"),
  learningPreference: z
    .string()
    .min(2, "Learning preference is required"),
  apiKey: z.string().optional(),
});

export const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title cannot be empty"),
  learningObjective: z.string().min(1, "Lesson learning objective cannot be empty"),
});

export const moduleSchema = z.object({
  title: z.string().min(1, "Module title cannot be empty"),
  description: z.string().min(1, "Module description cannot be empty"),
  estimatedMinutes: z.number().int().positive("Estimated minutes must be positive"),
  lessons: z.array(lessonSchema).min(1, "Each module must have at least one lesson"),
});

export const courseOutlineSchema = z.object({
  title: z.string().min(1, "Course title cannot be empty"),
  description: z.string().min(1, "Course description cannot be empty"),
  learningObjectives: z
    .array(z.string())
    .min(1, "Course must have at least one learning objective"),
  estimatedDuration: z.string().min(1, "Estimated duration cannot be empty"),
  modules: z.array(moduleSchema).min(1, "Course must have at least one module"),
});

export const modifyOutlineInputSchema = z.object({
  currentOutline: courseOutlineSchema,
  modifications: z
    .string()
    .min(3, "Modification prompt must be at least 3 characters")
    .max(1000, "Modification prompt cannot exceed 1000 characters"),
  setupParams: courseSetupInputSchema.omit({ apiKey: true }),
  apiKey: z.string().optional(),
});

export const saveCourseInputSchema = z.object({
  outline: courseOutlineSchema,
  setupParams: courseSetupInputSchema.omit({ apiKey: true }),
});
