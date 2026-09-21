import { z } from "zod";
import katex from "katex";
import {
  DOMAINS,
  domainEnum,
  levelEnum,
  languageEnum,
  topicClassificationSchema,
  chartBlockSchema,
  diagramBlockSchema,
  tableBlockSchema,
  codeBlockSchema,
  syntaxBlockSchema,
  exampleBlockSchema,
  realLifeBlockSchema,
  commonMistakesBlockSchema,
  timelineBlockSchema,
  mnemonicBlockSchema,
  quickSummaryBlockSchema,
  keyPointsBlockSchema,
} from "../cheatsheets/cheatsheet.validator.js";

export { DOMAINS, domainEnum, levelEnum, languageEnum, topicClassificationSchema };

/**
 * Quick Learn specific block definitions
 */
export const definitionBlockSchema = z.object({
  type: z.literal("definition"),
  text: z.string().min(10, "Definition text must be at least 10 characters"),
});

export const simpleExplanationBlockSchema = z.object({
  type: z.literal("simple_explanation"),
  text: z.string().min(10, "Simple explanation must be at least 10 characters"),
});

export const formulaBlockSchema = z
  .object({
    type: z.literal("formula"),
    name: z.string().min(2, "Formula name is required"),
    latex: z.string().min(1, "LaTeX expression is required"),
    explanation: z.string().min(5, "Formula explanation is required"),
    variables: z
      .array(
        z.object({
          symbol: z.string().min(1, "Symbol is required"),
          meaning: z.string().min(2, "Variable meaning is required"),
        })
      )
      .min(1, "At least one variable must be documented"),
  })
  .superRefine((data, ctx) => {
    try {
      katex.renderToString(data.latex, {
        throwOnError: true,
        displayMode: true,
      });
    } catch (katexErr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["latex"],
        message: `Invalid LaTeX syntax for KaTeX: ${katexErr.message}`,
      });
    }
  });

export const stepByStepBlockSchema = z.object({
  type: z.literal("step_by_step"),
  title: z.string().optional(),
  steps: z
    .array(
      z.object({
        step: z.number().int(),
        title: z.string().min(2, "Step title is required"),
        explanation: z.string().min(5, "Step explanation is required"),
      })
    )
    .min(2, "At least 2 steps required in step-by-step breakdown"),
});

export const takeawaysBlockSchema = z.object({
  type: z.literal("takeaways"),
  items: z.array(z.string().min(3)).min(2, "At least 2 takeaways required"),
});

export const quizQuestionSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  options: z.array(z.string().min(1)).length(4, "Mini quiz question must have exactly 4 options"),
  correctOptionIndex: z.number().int().min(0).max(3, "correctOptionIndex must be an integer from 0 to 3"),
  explanation: z.string().min(5, "Question explanation is required"),
});

export const miniQuizBlockSchema = z.object({
  type: z.literal("mini_quiz"),
  questions: z.array(quizQuestionSchema).min(1, "At least 1 quiz question required"),
});

export const qnaCardSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(5, "Answer must be at least 5 characters"),
  hint: z.string().optional(),
  concept: z.string().optional(),
});

export const qnaBlockSchema = z.object({
  type: z.literal("qna"),
  title: z.string().optional().default("Active Recall & Self-Check Cards"),
  items: z.array(qnaCardSchema).min(1, "At least 1 Q&A card is required"),
});

/**
 * Union of all allowed block types in Quick Learn
 */
export const topicBlockSchema = z.discriminatedUnion("type", [
  definitionBlockSchema,
  simpleExplanationBlockSchema,
  keyPointsBlockSchema,
  formulaBlockSchema,
  chartBlockSchema,
  diagramBlockSchema,
  tableBlockSchema,
  codeBlockSchema,
  syntaxBlockSchema,
  stepByStepBlockSchema,
  exampleBlockSchema,
  realLifeBlockSchema,
  commonMistakesBlockSchema,
  timelineBlockSchema,
  mnemonicBlockSchema,
  quickSummaryBlockSchema,
  takeawaysBlockSchema,
  miniQuizBlockSchema,
  qnaBlockSchema,
]);

/**
 * Root Schema for Generated Quick Learn Content
 */
export const generatedTopicContentSchema = z
  .object({
    title: z.string().min(2, "Title is required"),
    topic: z.string().min(2, "Topic name is required"),
    domain: domainEnum,
    subdomain: z.string().min(2, "Subdomain is required"),
    level: levelEnum,
    language: languageEnum.default("english"),
    estimatedReadingTime: z.string().min(1).default("6 mins"),
    visualizationType: z.string().default("none"),
    blocks: z.array(topicBlockSchema).min(5, "Quick Learn content must have at least 5 blocks").max(18),
  })
  .superRefine((data, ctx) => {
    // 1. Enforce domain restrictions on code and syntax blocks
    const isCsDomain = data.domain === "programming" || data.domain === "computer_science";
    data.blocks.forEach((block, index) => {
      if ((block.type === "code" || block.type === "syntax") && !isCsDomain) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["blocks", index],
          message: `Code/syntax blocks are prohibited for non-CS domain "${data.domain}". Use domain-appropriate blocks (formulas, charts, tables, diagrams, or real_life examples) instead.`,
        });
      }
    });

    // 2. Validate that mini_quiz block has valid questions
    const quizBlocks = data.blocks.filter((b) => b.type === "mini_quiz");
    quizBlocks.forEach((qb, qbIndex) => {
      qb.questions?.forEach((q, qIndex) => {
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["blocks", qbIndex, "questions", qIndex, "options"],
            message: "Mini quiz question must contain exactly 4 options.",
          });
        }
        if (typeof q.correctOptionIndex !== "number" || q.correctOptionIndex < 0 || q.correctOptionIndex > 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["blocks", qbIndex, "questions", qIndex, "correctOptionIndex"],
            message: "correctOptionIndex must be an integer between 0 and 3.",
          });
        }
      });
    });
  });
