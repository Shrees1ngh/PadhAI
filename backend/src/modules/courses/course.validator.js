import { z } from "zod";

export const courseSetupInputSchema = z.object({
  topic: z
    .string()
    .min(2, "Topic must be at least 2 characters")
    .max(150, "Topic must be under 150 characters"),
  learningGoal: z
    .string()
    .min(2, "Learning goal must be at least 2 characters")
    .max(300, "Learning goal must be under 300 characters")
    .optional()
    .default("Mastery and practical application"),
  currentLevel: z.enum(["Beginner", "Intermediate", "Advanced"], {
    errorMap: () => ({ message: "Level must be Beginner, Intermediate, or Advanced" }),
  }).optional().default("Beginner"),
  durationDays: z
    .number({ coerce: true })
    .int()
    .min(1, "Duration must be at least 1 day")
    .max(180, "Duration cannot exceed 180 days")
    .optional()
    .default(10),
  dailyStudyTime: z
    .string()
    .optional()
    .default("1-2 hours"),
  category: z
    .string()
    .optional()
    .default("Programming & Computer Science"),
  includeVideos: z
    .boolean()
    .optional()
    .default(true),
  bannerGradient: z
    .string()
    .optional()
    .default("from-indigo-600 via-purple-600 to-cyan-500"),
  learningPreference: z
    .string()
    .optional()
    .default("video, hands-on, detailed"),
  apiKey: z.string().optional(),
});

export const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title cannot be empty"),
  learningObjective: z.string().min(1, "Lesson learning objective cannot be empty"),
  estimatedMinutes: z.number().int().positive().optional().default(30),
});

export const moduleSchema = z.object({
  title: z.string().min(1, "Module title cannot be empty"),
  description: z.string().min(1, "Module description cannot be empty"),
  estimatedMinutes: z.number().int().positive("Estimated minutes must be positive").optional().default(60),
  lessons: z.array(lessonSchema).min(1, "Each module must have at least one lesson"),
});

export const courseDaySchema = z.object({
  day: z.number().int().min(1, "Day must be >= 1"),
  title: z.string().min(1, "Day title cannot be empty"),
  learningObjective: z.string().optional().default("Master key concepts for today's curriculum"),
  moduleTitle: z.string().optional().default("Core Module"),
  lessons: z.array(lessonSchema).min(1, "Each day must have at least one lesson"),
});

export const courseOutlineSchema = z.object({
  title: z.string().min(1, "Course title cannot be empty"),
  description: z.string().min(1, "Course description cannot be empty"),
  learningObjectives: z
    .array(z.string())
    .min(1, "Course must have at least one learning objective"),
  estimatedDuration: z.string().min(1, "Estimated duration cannot be empty"),
  durationDays: z.number().int().min(1).optional(),
  category: z.string().optional(),
  includeVideos: z.boolean().optional(),
  bannerGradient: z.string().optional(),
  setupParams: z.any().optional(),
  days: z.array(courseDaySchema).optional().default([]),
  modules: z.array(moduleSchema).min(1, "Course must have at least one module"),
});

/**
 * Normalizes course outline to guarantee that `days` has exactly `durationDays` items (Day 1..Day N)
 * and `modules` and `days` are completely aligned.
 */
export const normalizeCourseOutline = (outline, targetDurationDays = 10) => {
  const duration = targetDurationDays || outline.durationDays || outline.days?.length || 10;
  let days = Array.isArray(outline.days) && outline.days.length > 0 ? [...outline.days] : [];
  let modules = Array.isArray(outline.modules) && outline.modules.length > 0 ? [...outline.modules] : [];

  // Case 1: If days array is missing or empty, synthesize days from modules
  if (days.length === 0 && modules.length > 0) {
    const allLessons = [];
    modules.forEach((mod) => {
      (mod.lessons || []).forEach((less) => {
        allLessons.push({
          title: less.title,
          learningObjective: less.learningObjective || less.title,
          moduleTitle: mod.title,
          estimatedMinutes: less.estimatedMinutes || 30,
        });
      });
    });

    for (let d = 1; d <= duration; d++) {
      // Distribute lessons evenly across duration days
      const startIndex = Math.floor(((d - 1) * allLessons.length) / duration);
      const endIndex = Math.floor((d * allLessons.length) / duration);
      const dayLessons = allLessons.slice(startIndex, Math.max(startIndex + 1, endIndex));

      const primaryLesson = dayLessons[0] || {
        title: `${outline.title || "Topic"} — Day ${d} Core Concepts`,
        learningObjective: `Understand key principles and applications for Day ${d}`,
        moduleTitle: `Module ${Math.ceil((d / duration) * (modules.length || 3))}`,
        estimatedMinutes: 45,
      };

      days.push({
        day: d,
        title: `Day ${d}: ${primaryLesson.title}`,
        learningObjective: primaryLesson.learningObjective,
        moduleTitle: primaryLesson.moduleTitle || `Module ${Math.ceil((d / duration) * 3)}`,
        lessons: dayLessons.length > 0 ? dayLessons.map(l => ({
          title: l.title,
          learningObjective: l.learningObjective,
          estimatedMinutes: l.estimatedMinutes || 30
        })) : [{
          title: primaryLesson.title,
          learningObjective: primaryLesson.learningObjective,
          estimatedMinutes: 30
        }],
      });
    }
  }

  // Case 2: If days array exists but length !== duration
  if (days.length !== duration) {
    if (days.length > duration) {
      // Trim excess and re-index
      days = days.slice(0, duration);
    } else {
      // Expand to reach duration days
      const lastDay = days[days.length - 1];
      while (days.length < duration) {
        const nextDayNum = days.length + 1;
        days.push({
          day: nextDayNum,
          title: `Day ${nextDayNum}: Revision, Practice & Capstone Integration`,
          learningObjective: `Consolidate knowledge and apply concepts from preceding modules through practice`,
          moduleTitle: lastDay?.moduleTitle || `Final Module`,
          lessons: [
            {
              title: `Day ${nextDayNum} Practical Assessment & Review`,
              learningObjective: `Demonstrate mastery through practical exercises and problem-solving`,
              estimatedMinutes: 45,
            },
          ],
        });
      }
    }
  }

  // Ensure 1-indexed sequential day numbering
  days = days.map((dayObj, idx) => ({
    ...dayObj,
    day: idx + 1,
    title: dayObj.title?.startsWith(`Day ${idx + 1}`) ? dayObj.title : `Day ${idx + 1}: ${dayObj.title || "Core Lesson"}`,
  }));

  // Case 3: If modules array is missing or empty, synthesize modules from days
  if (modules.length === 0 && days.length > 0) {
    const moduleMap = new Map();
    days.forEach((d) => {
      const modName = d.moduleTitle || `Module ${Math.ceil((d.day / days.length) * 3)}`;
      if (!moduleMap.has(modName)) {
        moduleMap.set(modName, {
          title: modName,
          description: `Comprehensive study covering ${modName}`,
          estimatedMinutes: 0,
          lessons: [],
        });
      }
      const targetMod = moduleMap.get(modName);
      (d.lessons || []).forEach((l) => {
        targetMod.lessons.push({
          title: l.title,
          learningObjective: l.learningObjective,
          estimatedMinutes: l.estimatedMinutes || 30,
        });
        targetMod.estimatedMinutes += (l.estimatedMinutes || 30);
      });
    });
    modules = Array.from(moduleMap.values());
  }

  return {
    ...outline,
    durationDays: duration,
    estimatedDuration: `${duration} Days • ${outline.setupParams?.dailyStudyTime || "2 hours/day"}`,
    days,
    modules,
  };
};

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
