import { z } from "zod";

export const cheatsheetKeyConceptSchema = z.union([
  z.object({
    concept: z.string().default(""),
    explanation: z.string().default(""),
  }),
  z.string().transform((str) => ({
    concept: str.split(":")[0]?.trim() || str,
    explanation: str.split(":").slice(1).join(":").trim() || str,
  })),
]);

export const cheatsheetDefinitionSchema = z.union([
  z.object({
    term: z.string().default(""),
    definition: z.string().default(""),
  }),
  z.string().transform((str) => ({
    term: str.split(":")[0]?.trim() || str,
    definition: str.split(":").slice(1).join(":").trim() || str,
  })),
]);

export const cheatsheetFormulaSchema = z.union([
  z.object({
    name: z.string().default(""),
    formula: z.string().default(""),
    explanation: z.string().default(""),
  }),
  z.string().transform((str) => ({
    name: str.split(":")[0]?.trim() || "Formula",
    formula: str.split(":").slice(1).join(":").trim() || str,
    explanation: "",
  })),
]);

export const cheatsheetSyntaxSchema = z.union([
  z.object({
    title: z.string().default(""),
    pattern: z.string().default(""),
    explanation: z.string().default(""),
  }),
  z.string().transform((str) => ({
    title: "Pattern",
    pattern: str,
    explanation: "",
  })),
]);

export const cheatsheetExampleSchema = z.union([
  z.object({
    topic: z.string().default("General"),
    example: z.string().default(""),
    explanation: z.string().default(""),
  }),
  z.string().transform((str) => ({
    topic: "Example",
    example: str,
    explanation: "",
  })),
]);

export const cheatsheetMistakeSchema = z.union([
  z.object({
    mistake: z.string().default(""),
    correction: z.string().default(""),
    explanation: z.string().default(""),
  }),
  z.string().transform((str) => ({
    mistake: str,
    correction: "",
    explanation: "",
  })),
]);

export const generatedCheatsheetSchema = z.object({
  title: z.string().default("Structured Revision Cheatsheet"),
  overview: z.string().default(""),
  keyConcepts: z.array(cheatsheetKeyConceptSchema).default([]),
  definitions: z.array(cheatsheetDefinitionSchema).default([]),
  importantRules: z.array(z.string()).default([]),
  formulas: z.array(cheatsheetFormulaSchema).default([]),
  syntaxPatterns: z.array(cheatsheetSyntaxSchema).default([]),
  examples: z.array(cheatsheetExampleSchema).default([]),
  commonMistakes: z.array(cheatsheetMistakeSchema).default([]),
  quickRevisionPoints: z.array(z.string()).default([]),
});

export const generateCheatsheetInputSchema = z.object({
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

export const saveCheatsheetInputSchema = z.object({
  courseId: z.string().optional(),
  moduleIndex: z.number().optional(),
  lessonIndex: z.number().optional(),
  lessonTitle: z.string().min(1, "Lesson title is required"),
  sourceType: z.enum(["lesson", "study-material"]).optional().default("lesson"),
  cheatsheet: generatedCheatsheetSchema,
});
