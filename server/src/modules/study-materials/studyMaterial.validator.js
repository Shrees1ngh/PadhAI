import { z } from "zod";

export const keyConceptSchema = z.union([
  z.object({
    concept: z.string().default(""),
    explanation: z.string().default(""),
  }),
  z.string().transform((str) => ({
    concept: str.split(":")[0]?.trim() || str,
    explanation: str.split(":").slice(1).join(":").trim() || str,
  })),
]);

export const definitionSchema = z.union([
  z.object({
    term: z.string().default(""),
    definition: z.string().default(""),
  }),
  z.string().transform((str) => ({
    term: str.split(":")[0]?.trim() || str,
    definition: str.split(":").slice(1).join(":").trim() || str,
  })),
]);

export const exampleSchema = z.union([
  z.object({
    topic: z.string().default("General"),
    example: z.string().default(""),
    explanation: z.string().default(""),
  }),
  z.string().transform((str) => ({
    topic: "Core Concept",
    example: str,
    explanation: "",
  })),
]);

export const importantFormulaSchema = z.union([
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

export const commonMistakeSchema = z.union([
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

export const practiceQuestionSchema = z.union([
  z.object({
    question: z.string(),
    options: z.array(z.string()).optional().default([]),
    answer: z.string().default(""),
    explanation: z.string().default(""),
    difficulty: z.string().optional().default("Medium"),
  }),
  z.string().transform((str) => ({
    question: str,
    options: [],
    answer: "",
    explanation: "",
    difficulty: "Medium",
  })),
]);

export const studyMaterialAnalysisSchema = z.object({
  documentTitle: z.string().default("Analyzed Study Material"),
  summary: z.string().default(""),
  importantTopics: z.array(z.string()).default([]),
  keyConcepts: z.array(keyConceptSchema).default([]),
  keyPoints: z.array(z.string()).default([]),
  definitions: z.array(definitionSchema).default([]),
  examples: z.array(exampleSchema).default([]),
  importantFormulas: z.array(importantFormulaSchema).default([]),
  commonMistakes: z.array(commonMistakeSchema).default([]),
  practiceQuestions: z.array(practiceQuestionSchema).default([]),
  suggestedStudyTopics: z.array(z.string()).default([]),
});
