import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanAndParseJson, resolveApiKey } from "./gemini.service.js";
import { generatedCheatsheetSchema } from "../modules/cheatsheets/cheatsheet.validator.js";

/**
 * Generate a demo cheatsheet for developer demo mode.
 */
const generateDemoCheatsheet = ({ lessonTitle, currentLevel = "Intermediate" }) => {
  return {
    title: `${lessonTitle} — High-Yield Revision Cheatsheet`,
    overview: `Dense, exam-oriented synthesis of ${lessonTitle}. Designed for rapid recall and conceptual precision at the ${currentLevel} level.`,
    keyConcepts: [
      {
        concept: "Core Invariants",
        explanation: "Immutable properties that must hold true across all state mutations.",
      },
      {
        concept: "Boundary Contracts",
        explanation: "Strict schema enforcement at I/O layers to shield underlying processors.",
      },
      {
        concept: "Asynchronous Pipelines",
        explanation: "Non-blocking event lifecycles enabling concurrent processing.",
      },
    ],
    definitions: [
      {
        term: "Idempotence",
        definition: "An operation that can be applied multiple times without altering the result beyond the initial application.",
      },
      {
        term: "Backpressure",
        definition: "A resistance force opposing the desired flow of data in a software pipeline when consumers cannot keep pace with producers.",
      },
    ],
    importantRules: [
      "Always validate external inputs before passing them into internal service methods.",
      "Never swallow asynchronous rejections without structured diagnostic logging.",
      "Prefer immutable data structures when passing state across component boundaries.",
      "Ensure all database queries utilize indexed fields for sub-millisecond retrieval.",
    ],
    formulas: [
      {
        name: "Little's Law",
        formula: "L = \\lambda \\times W",
        explanation: "Relates the long-term average number of items (L) to arrival rate (\\lambda) and waiting time (W).",
      },
    ],
    syntaxPatterns: [
      {
        title: "Defensive Validation Pattern",
        pattern: "const validated = schema.parse(rawInput);",
        explanation: "Fails fast at the boundary with descriptive schema error reporting.",
      },
    ],
    examples: [
      {
        topic: "Graceful Fallback",
        example: "if (!dbReady) return res.status(503).json({ mongoUnavailable: true });",
        explanation: "Prevents silent failure while informing the client about persistence status.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Assuming network requests will always resolve within standard timeout windows.",
        correction: "Implement explicit circuit breakers and retry policies with exponential backoff.",
        explanation: "Protects upstream clients from resource exhaustion during cascading downtimes.",
      },
    ],
    quickRevisionPoints: [
      "Decouple state from representation.",
      "Enforce boundary validation with Zod.",
      "Handle offline database gracefully with explicit 503 status.",
      "Keep LLM API keys strictly on the server backend.",
    ],
  };
};

/**
 * Generates an AI-powered high-yield revision cheatsheet using Gemini.
 *
 * @param {Object} params
 * @param {string} params.lessonTitle
 * @param {string} params.lessonContent
 * @param {string} [params.courseTopic]
 * @param {string} [params.currentLevel="Intermediate"]
 * @param {string} [params.apiKey]
 */
export const generateCheatsheetWithGemini = async ({
  lessonTitle,
  lessonContent,
  courseTopic = "",
  currentLevel = "Intermediate",
  apiKey,
}) => {
  const activeKey = resolveApiKey(apiKey);

  if (!activeKey) {
    const error = new Error(
      "Gemini API key is required. Please set GEMINI_API_KEY in server/.env or provide your key."
    );
    error.status = 400;
    error.code = "MISSING_API_KEY";
    throw error;
  }

  if (activeKey === "DEMO_MODE") {
    return generateDemoCheatsheet({ lessonTitle, currentLevel });
  }

  const prompt = `You are PadhAI's master Academic Cheatsheet Architect.

TASK:
Create an ultra-dense, exam/revision-focused CHEATSHEET on "${lessonTitle}"${
    courseTopic ? ` in the context of "${courseTopic}"` : ""
  } for a learner at the **${currentLevel}** level.

STRICT PEDAGOGICAL GUIDELINES:
1. Conciseness & Density: Eliminate all conversational filler, lengthy intros, and generic commentary. Every line must carry maximum informational and revision value.
2. Grounding: Rely strictly on the source content provided below. Preserve specific terminology, equations, algorithms, syntax rules, and classifications verbatim from the source.
3. Level Customization: Adapt technical depth to the ${currentLevel} level.
4. Markdown Formatting: Use concise markdown tables, bullet points, or code formatting inside strings where appropriate.
5. Strict JSON Output: Output MUST be valid JSON only matching the schema below.

JSON SCHEMA:
{
  "title": "string (${lessonTitle} — High-Yield Revision Cheatsheet)",
  "overview": "string (Ultra-concise 2-3 sentence core summary of the entire topic)",
  "keyConcepts": [
    {
      "concept": "string (Core concept name)",
      "explanation": "string (Dense 1-2 sentence explanation of the mechanism)"
    }
  ],
  "definitions": [
    {
      "term": "string (Key term/acronym)",
      "definition": "string (Precise technical definition)"
    }
  ],
  "importantRules": [
    "string (Must-know rule, invariant, theorem, or axiom)"
  ],
  "formulas": [
    {
      "name": "string (Equation / Formula name)",
      "formula": "string (LaTeX or code notation)",
      "explanation": "string (Variable definitions and application context)"
    }
  ],
  "syntaxPatterns": [
    {
      "title": "string (Pattern or signature name)",
      "pattern": "string (Code snippet, API signature, or pattern template)",
      "explanation": "string (When and how to use it)"
    }
  ],
  "examples": [
    {
      "topic": "string (Concept topic)",
      "example": "string (Minimal, high-signal concrete example or code)",
      "explanation": "string (Takeaway)"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "string (Common exam / implementation pitfall)",
      "correction": "string (The correct rule or approach)",
      "explanation": "string (Why students get confused)"
    }
  ],
  "quickRevisionPoints": [
    "string (Punchy, 1-liner bullet for 60-second rapid pre-exam recall)"
  ]
}

SOURCE MATERIAL CONTENT:
"""
${lessonContent.slice(0, 75000)}
"""`;

  let rawOutput = "";

  try {
    // Attempt 1: @google/genai SDK
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      rawOutput =
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        response?.text ||
        "";
    } catch (sdkErr) {
      console.warn(
        "Primary @google/genai call failed for cheatsheet, falling back to @google/generative-ai:",
        sdkErr.message
      );
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });
      const result = await model.generateContent(prompt);
      rawOutput = result.response.text();
    }

    const parsed = cleanAndParseJson(rawOutput);
    return generatedCheatsheetSchema.parse(parsed);
  } catch (error) {
    console.error("Cheatsheet generation failed:", error.message);
    if (error.name === "ZodError") {
      throw new Error(
        `Gemini generated cheatsheet did not match the expected schema: ${error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
};
