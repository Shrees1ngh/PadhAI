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

export const cheatsheetCardSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  number: z.union([z.number(), z.string()]).default(1),
  title: z.string().default("Key Concept"),
  definition: z.string().default(""),
  bulletPoints: z.array(z.string()).default([]),
  formula: z.string().optional().default(""),
  codeSnippet: z.string().optional().default(""),
  codeLanguage: z.string().optional().default(""),
  example: z.string().optional().default(""),
  visualDiagram: z.string().optional().default(""),
  examTip: z.string().optional().default(""),
  categoryType: z.string().optional().default("Concept"),
  badgeColor: z.string().optional().default("indigo"),
});

export const comparisonTableRowSchema = z.object({
  type: z.string().default(""),
  definition: z.string().default(""),
  example: z.string().default(""),
  use: z.string().default(""),
  badgeColor: z.string().optional().default("indigo"),
});

export const comparisonTableSchema = z.object({
  title: z.string().default("Comparison Matrix"),
  headers: z.array(z.string()).default(["Type", "Definition", "Example", "Use"]),
  rows: z.array(comparisonTableRowSchema).default([]),
});

export const generatedCheatsheetSchema = z.object({
  unitNumber: z.union([z.number(), z.string()]).optional().default("UNIT REVISION"),
  topicDomain: z.string().optional().default("general"),
  title: z.string().default("Structured Revision Cheatsheet"),
  subtitle: z.string().optional().default(""),
  overview: z.string().default(""),
  cards: z.array(cheatsheetCardSchema).optional().default([]),
  comparisonTable: comparisonTableSchema.optional(),
  keyConcepts: z.array(cheatsheetKeyConceptSchema).default([]),
  definitions: z.array(cheatsheetDefinitionSchema).default([]),
  importantRules: z.array(z.string()).default([]),
  formulas: z.array(cheatsheetFormulaSchema).default([]),
  syntaxPatterns: z.array(cheatsheetSyntaxSchema).default([]),
  examples: z.array(cheatsheetExampleSchema).default([]),
  commonMistakes: z.array(cheatsheetMistakeSchema).default([]),
  quickRevisionPoints: z.array(z.string()).default([]),
  examPoints: z.array(z.string()).optional().default([]),
  topperTip: z.string().optional().default("Understand Concepts ➔ Practice Examples ➔ Write Definitions ➔ Revise Regularly"),
});

export const generateCheatsheetInputSchema = z.object({
  lessonTitle: z.string().min(1, "Lesson title or source title is required"),
  lessonContent: z.union([z.string(), z.record(z.any())]).optional().default(""),
  courseTopic: z.string().optional().default(""),
  currentLevel: z.string().optional().default("Intermediate"),
  courseId: z.string().optional().default(""),
  moduleIndex: z.number().optional().default(0),
  lessonIndex: z.number().optional().default(0),
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
