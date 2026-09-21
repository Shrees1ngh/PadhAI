import { GoogleGenAI } from "@google/genai";
import { cleanAndParseJson, resolveApiKey } from "./gemini.service.js";
import { generatedCheatsheetSchema } from "../modules/cheatsheets/cheatsheet.validator.js";
import { ENV } from "../config/env.js";

/**
 * Generate high-yield revision cheatsheet for demo mode in non-production.
 */
const generateDemoCheatsheet = ({ lessonTitle = "Core Concept Summary", currentLevel = "Beginner" }) => {
  return {
    isDemo: true,
    unitNumber: "DEMO REVISION UNIT",
    topicDomain: "general",
    title: `${lessonTitle} — High-Yield Cheatsheet (Demo Mode)`,
    subtitle: `Synthesized Overview calibrated for ${currentLevel} Level`,
    overview: `This is a sample revision cheatsheet generated in developer demo mode for "${lessonTitle}". Add your personal Gemini API Key in Settings to generate 100% custom real-time curriculum.`,
    cards: [
      {
        number: 1,
        title: "Core Architectural Principle",
        categoryType: "Fundamental Law",
        definition: `Fundamental mental model and conceptual foundation for ${lessonTitle}.`,
        bulletPoints: [
          "**Foundational Invariant:** Guarantees state isolation across all operations.",
          "**Execution Lifecycle:** Predictable deterministic state transitions.",
          "**Fault Tolerance:** Graceful degradation under high resource contention."
        ],
        formula: "\\text{Throughput} = \\frac{\\text{Total Work}}{\\text{Latency} \\times N}",
        codeSnippet: `// Example demonstration pattern\nfunction executeOperation(input) {\n  return { status: 'success', processed: input };\n}`,
        codeLanguage: "javascript",
        example: "Real-world analogy: A high-speed dispatch router organizing independent tasks.",
        visualDiagram: `   [Input Request] ---> [Validation Layer] ---> [State Commit]
                               |
                               +---> [Telemetry Emitted]`,
        examTip: "High-Yield Rule: Always enforce idempotency before distributed network retries."
      },
      {
        number: 2,
        title: "Key Tradeoffs & Optimization",
        categoryType: "Analysis & Metrics",
        definition: "Evaluating operational boundaries, computational complexity, and storage overhead.",
        bulletPoints: [
          "**Time Complexity:** $\\mathcal{O}(1)$ average lookup with $\\mathcal{O}(N)$ worst-case rebalancing.",
          "**Space Overhead:** Minimal memory footprint with indexed pointers.",
          "**Concurrency Model:** Non-blocking read operations with transactional write locks."
        ],
        formula: "\\mathcal{O}(\\log N) \\le \\text{Time} \\le \\mathcal{O}(N)",
        codeSnippet: "",
        codeLanguage: "",
        example: "Database index lookups favoring binary tree structures over sequential scans.",
        visualDiagram: `  (Root)
   /   \\
 [L]   [R]`,
        examTip: "Exam Trap: Do not confuse memory bandwidth limits with CPU instruction cycle bottlenecks."
      }
    ],
    comparisonTable: {
      title: "Core Paradigm Comparison",
      headers: ["Approach", "Time Profile", "Fault Resilience", "Recommended Scenario"],
      rows: [
        {
          type: "Naïve Direct Execution",
          definition: "Synchronous blocking processing",
          example: "Direct database write",
          use: "Low-throughput local scripts",
          badgeColor: "rose"
        },
        {
          type: "Asynchronous Buffered Queue",
          definition: "Decoupled message passing",
          example: "Kafka / Redis Streams pipeline",
          use: "Production scale distributed services",
          badgeColor: "emerald"
        }
      ]
    },
    quickRevisionPoints: [
      "Verify system invariants before executing state mutations.",
      "Prefer immutable state updates over in-place destructive alterations.",
      "Isolate external network dependencies behind bounded timeouts.",
      "Benchmark real production traces rather than synthetic micro-benchmarks."
    ],
    examPoints: [
      "What is the primary operational trade-off when selecting synchronous vs asynchronous processing?",
      "How does idempotency mitigate duplicate request errors in distributed architectures?",
      "Under what network partition conditions does CAP theorem sacrifice consistency?"
    ],
    topperTip: "Draw visual architecture flowcharts on exam questions before writing implementation code to ensure complete structural clarity."
  };
};

/**
 * Generate a dense, high-yield revision cheatsheet using Gemini.
 */
export const generateCheatsheetWithGemini = async ({
  lessonTitle,
  lessonContent,
  courseTopic,
  currentLevel = "Beginner",
  apiKey,
}) => {
  const activeKey = resolveApiKey(apiKey);

  if (!activeKey) {
    const error = new Error(
      "Gemini API key is required. Please add GEMINI_API_KEY in server/.env or provide your personal key in Settings."
    );
    error.status = 401;
    error.code = "INVALID_API_KEY";
    throw error;
  }

  // Allow developer demo mode only when not in production
  if (activeKey === "DEMO_MODE") {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("Demo mode is disabled in production. Please configure a valid Gemini API key.");
      error.status = 401;
      error.code = "INVALID_API_KEY";
      throw error;
    }
    return generateDemoCheatsheet({ lessonTitle, currentLevel });
  }

  let contentText = "";
  if (typeof lessonContent === "string") {
    contentText = lessonContent;
  } else if (lessonContent && typeof lessonContent === "object") {
    contentText = JSON.stringify(lessonContent, null, 2);
  }

  const prompt = `You are PadhAI's Master Academic Infographic Cheatsheet Architect. Your mission is to generate an ULTRA-HIGH-YIELD, BEAUTIFULLY STRUCTURED 1-PAGE VISUAL REVISION CHEATSHEET on "${lessonTitle}"${
    courseTopic ? ` (in the context of "${courseTopic}")` : ""
  } for a student at the **${currentLevel}** level.

Output MUST be strictly valid JSON conforming to the schema below. No markdown fences around the JSON, no prologue or epilogue.

EXACT JSON SCHEMA TO SATISFY:
{
  "unitNumber": "UNIT 1 / MODULE 2 / TOPIC REVISION",
  "topicDomain": "economics | computer_science | science_math | law_humanities | general",
  "title": "${lessonTitle}",
  "subtitle": "${courseTopic || 'High-Yield Visual Revision Cheatsheet'}",
  "overview": "Ultra-concise 2-sentence synthesis of this topic in simple, easy-to-understand language.",
  "cards": [
    {
      "number": 1,
      "title": "CLEAR BOLD CONCEPT NAME",
      "categoryType": "Core Law / Graph / Formula / Real-Life Example / Algorithm / Assumption / Pitfall",
      "definition": "1-2 sentence crystal clear explanation in simple, easy language.",
      "bulletPoints": [
        "**Key Sub-Point 1:** Explanation",
        "**Key Sub-Point 2:** Explanation",
        "**Key Sub-Point 3:** Explanation"
      ],
      "formula": "LaTeX or clean formula string (if math/econ/science applicable, otherwise empty string)",
      "codeSnippet": "Working code snippet (ONLY if CS/tech topic, otherwise empty string)",
      "codeLanguage": "javascript / python / sql (ONLY if CS/tech topic, otherwise empty string)",
      "example": "Concrete everyday relatable real-life example illustrating this concept.",
      "visualDiagram": "ASCII visual graph / curve / schedule / tree / flowchart diagram",
      "examTip": "High-yield exam trap or mnemonic rule to remember."
    }
  ],
  "comparisonTable": {
    "title": "Key Comparisons & Paradigms Matrix",
    "headers": ["Concept / Variant", "Definition", "Example / Curve Behavior", "Primary Exam Use"],
    "rows": [
      {
        "type": "Name",
        "definition": "Definition text",
        "example": "Concrete example / curve description",
        "use": "Where to use / exam significance",
        "badgeColor": "indigo"
      }
    ]
  },
  "quickRevisionPoints": [
    "Punchy high-yield takeaway rule 1",
    "Punchy high-yield takeaway rule 2",
    "Punchy high-yield takeaway rule 3",
    "Punchy high-yield takeaway rule 4",
    "Punchy high-yield takeaway rule 5",
    "Punchy high-yield takeaway rule 6"
  ],
  "examPoints": [
    "Important University / Exam Question 1?",
    "Important University / Exam Question 2?",
    "Important University / Exam Question 3?",
    "Important University / Exam Question 4?",
    "Important University / Exam Question 5?"
  ],
  "topperTip": "Actionable, high-impact topper study advice for this specific subject."
}

Generate between 5 and 8 rich, comprehensive, domain-tailored cards covering all crucial aspects of "${lessonTitle}".

SOURCE MATERIAL CONTENT:
"""
${(contentText || lessonTitle).slice(0, 75000)}
"""`;

  let rawOutput = "";

  try {
    const ai = new GoogleGenAI({ apiKey: activeKey });
    const response = await ai.models.generateContent({
      model: ENV.GEMINI_MODEL || "gemini-3.6-flash",
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

    const parsed = cleanAndParseJson(rawOutput);
    return generatedCheatsheetSchema.parse(parsed);
  } catch (error) {
    console.error("Cheatsheet generation failed:", error.message);
    if (
      error.message?.includes("429") ||
      error.message?.includes("Quota exceeded") ||
      error.message?.includes("RESOURCE_EXHAUSTED") ||
      error.status === 429
    ) {
      const rateLimitErr = new Error(
        "Gemini API rate limit or daily quota reached. Please provide your own Gemini API key in Settings."
      );
      rateLimitErr.status = 429;
      rateLimitErr.code = "QUOTA_EXCEEDED";
      throw rateLimitErr;
    }
    if (
      error.message?.includes("API key not valid") ||
      error.message?.includes("API_KEY_INVALID") ||
      error.status === 401 ||
      error.code === "INVALID_API_KEY"
    ) {
      const keyErr = new Error("Invalid Gemini API Key. Please configure a valid key in Settings.");
      keyErr.status = 401;
      keyErr.code = "INVALID_API_KEY";
      throw keyErr;
    }
    if (error.name === "ZodError" || error.issues) {
      const issues = error.issues || error.errors || [];
      const valErr = new Error(
        `AI generated output did not match expected structure: ${issues.map((e) => e.message).join(", ")}`
      );
      valErr.status = 502;
      valErr.code = "AI_OUTPUT_INVALID";
      throw valErr;
    }
    const genErr = new Error(error.message || "Failed to generate cheatsheet.");
    genErr.status = error.status || 502;
    genErr.code = error.code || "AI_OUTPUT_INVALID";
    throw genErr;
  }
};
