import { z } from "zod";
import katex from "katex";

export const DOMAINS = [
  "programming",
  "computer_science",
  "mathematics",
  "statistics",
  "physics",
  "chemistry",
  "biology",
  "economics",
  "business_finance",
  "accounting",
  "law",
  "history",
  "geography",
  "political_science",
  "language_literature",
  "general",
];

export const domainEnum = z.enum(DOMAINS);
export const levelEnum = z.enum(["Beginner", "Intermediate", "Advanced"]);
export const languageEnum = z.enum(["english", "hinglish"]);

/**
 * Stage 1 Classification Schema
 */
export const topicClassificationSchema = z.object({
  domain: domainEnum,
  subdomain: z.string().min(2),
  needsChart: z.boolean(),
  needsCode: z.boolean(),
  needsFormula: z.boolean(),
  needsDiagram: z.boolean(),
  needsTimeline: z.boolean(),
});

/**
 * Individual Block Schemas (Discriminated Union)
 */
export const definitionBlockSchema = z.object({
  type: z.literal("definition"),
  text: z.string().min(10, "Definition text must be at least 10 characters"),
});

export const keyPointsBlockSchema = z.object({
  type: z.literal("key_points"),
  items: z.array(z.string().min(3)).min(2, "key_points must contain at least 2 items"),
});

export const formulaBlockSchema = z
  .object({
    type: z.literal("formula"),
    name: z.string().min(2, "Formula name is required"),
    latex: z.string().min(1, "LaTeX expression is required"),
    explanation: z.string().min(5, "Formula explanation is required"),
    variables: z.array(
      z.object({
        symbol: z.string().min(1, "Symbol is required"),
        meaning: z.string().min(2, "Variable meaning is required"),
      })
    ).min(1, "At least one variable must be documented"),
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

export const chartPointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

export const chartSeriesSchema = z.object({
  name: z.string().min(1),
  points: z.array(chartPointSchema).min(5, "Chart series must contain at least 5 finite points"),
});

export const chartMarkerSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  label: z.string().min(1),
});

export const chartBlockSchema = z.object({
  type: z.literal("chart"),
  chartType: z.enum(["line", "bar", "area", "scatter"]),
  title: z.string().min(3, "Chart title is required"),
  xLabel: z.string().min(1, "X-axis label is required"),
  yLabel: z.string().min(1, "Y-axis label is required"),
  series: z.array(chartSeriesSchema).min(1, "At least one chart series is required"),
  insight: z.string().min(10, "Chart analytical insight is required"),
  markers: z.array(chartMarkerSchema).optional(),
});

export const diagramBlockSchema = z.object({
  type: z.literal("diagram"),
  mermaid: z.string().min(10, "Mermaid code must be at least 10 characters"),
  caption: z.string().min(5, "Diagram caption is required"),
});

export const tableBlockSchema = z.object({
  type: z.literal("table"),
  title: z.string().min(2, "Table title is required"),
  headers: z.array(z.string().min(1)).min(2, "Table must have at least 2 column headers"),
  rows: z.array(z.array(z.string())).min(2, "Table must have at least 2 data rows"),
});

export const codeBlockSchema = z.object({
  type: z.literal("code"),
  language: z.string().min(1, "Code language is required"),
  code: z.string().min(5, "Code snippet is required"),
  explanation: z.string().min(5, "Code explanation is required"),
});

export const syntaxBlockSchema = z.object({
  type: z.literal("syntax"),
  language: z.string().min(1, "Syntax language is required"),
  snippet: z.string().min(3, "Syntax snippet is required"),
  notes: z.string().min(5, "Syntax notes are required"),
});

export const exampleBlockSchema = z.object({
  type: z.literal("example"),
  problem: z.string().min(5, "Problem description is required"),
  solution: z.string().min(5, "Solution explanation is required"),
});

export const realLifeBlockSchema = z.object({
  type: z.literal("real_life"),
  scenario: z.string().min(10, "Real life scenario is required"),
  connection: z.string().min(10, "Connection to topic is required"),
});

export const commonMistakesBlockSchema = z.object({
  type: z.literal("common_mistakes"),
  items: z.array(
    z.object({
      mistake: z.string().min(5, "Mistake description is required"),
      fix: z.string().min(5, "Correction/fix is required"),
    })
  ).min(1, "At least 1 common mistake item is required"),
});

export const timelineBlockSchema = z.object({
  type: z.literal("timeline"),
  events: z.array(
    z.object({
      when: z.string().min(1, "Event timeframe/year is required"),
      what: z.string().min(3, "Event description is required"),
    })
  ).min(2, "Timeline must contain at least 2 events"),
});

export const mnemonicBlockSchema = z.object({
  type: z.literal("mnemonic"),
  text: z.string().min(5, "Mnemonic text is required"),
});

export const quickSummaryBlockSchema = z.object({
  type: z.literal("quick_summary"),
  items: z.array(z.string().min(3)).min(2, "Quick summary must have at least 2 items"),
});

/**
 * Discriminated Union of all Block types
 */
export const blockSchema = z.discriminatedUnion("type", [
  definitionBlockSchema,
  keyPointsBlockSchema,
  formulaBlockSchema,
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
]);

/**
 * Full Generated Cheatsheet Schema with Domain-level Invariant Checks
 */
export const generatedCheatsheetSchema = z
  .object({
    title: z.string().min(3, "Cheatsheet title is required"),
    subtitle: z.string().min(3, "Subtitle is required"),
    domain: domainEnum,
    level: levelEnum.default("Beginner"),
    language: languageEnum.default("english"),
    blocks: z.array(blockSchema).min(6, "Cheatsheet must contain at least 6 blocks").max(16, "Cheatsheet cannot exceed 16 blocks"),
    isDemo: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const isCSDomain = data.domain === "programming" || data.domain === "computer_science";

    // Enforce: code and syntax blocks are REJECTED unless domain is programming or computer_science
    data.blocks.forEach((block, index) => {
      if ((block.type === "code" || block.type === "syntax") && !isCSDomain) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["blocks", index],
          message: `Code and syntax blocks are strictly prohibited for non-CS domain "${data.domain}". Use formulas, tables, charts, or diagrams instead.`,
        });
      }
    });
  });

/**
 * Controller Input Request Validation Schemas
 */
export const generateCheatsheetInputSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters").optional(),
  lessonTitle: z.string().min(2).optional(),
  lessonContent: z.union([z.string(), z.record(z.any())]).optional().default(""),
  courseTopic: z.string().optional().default(""),
  currentLevel: levelEnum.default("Beginner"),
  language: languageEnum.default("english"),
  courseId: z.string().optional().default(""),
  moduleIndex: z.coerce.number().optional().default(0),
  lessonIndex: z.coerce.number().optional().default(0),
  sourceType: z.enum(["lesson", "study-material", "standalone"]).optional().default("standalone"),
  regenerate: z.boolean().optional().default(false),
  apiKey: z.string().optional(),
}).refine(data => data.topic || data.lessonTitle, {
  message: "Either topic or lessonTitle must be provided",
  path: ["topic"],
});

export const saveCheatsheetInputSchema = z.object({
  courseId: z.string().optional().default(""),
  moduleIndex: z.coerce.number().optional().default(0),
  lessonIndex: z.coerce.number().optional().default(0),
  lessonTitle: z.string().min(1, "Topic title is required"),
  topic: z.string().optional(),
  sourceType: z.string().optional().default("standalone"),
  currentLevel: levelEnum.optional().default("Beginner"),
  language: languageEnum.optional().default("english"),
  domain: domainEnum.optional().default("general"),
  isDemo: z.boolean().optional().default(false),
  cheatsheet: z.record(z.any()),
});
