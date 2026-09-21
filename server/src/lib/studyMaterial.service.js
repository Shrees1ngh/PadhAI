import { resolveApiKey, callGemini } from "./gemini.service.js";
import { studyMaterialAnalysisSchema } from "../modules/study-materials/studyMaterial.validator.js";

/**
 * Generates demo study material analysis for developer demo mode.
 */
const generateDemoMaterialAnalysis = (filename = "Sample Document", learnerLevel = "Intermediate") => {
  return {
    isDemo: true,
    documentTitle: filename.replace(/\.[^/.]+$/, ""),
    summary:
      "This document provides a comprehensive overview of core concepts, structured principles, and practical real-world applications tailored for " +
      learnerLevel.toLowerCase() +
      " learners.",
    importantTopics: [
      "Foundational Principles & Architecture",
      "Core Mechanism & Execution Flow",
      "Optimization & Best Practices",
      "Common Pitfalls & Troubleshooting",
      "Practical Case Applications",
    ],
    keyConcepts: [
      {
        concept: "Core Architecture",
        explanation:
          "The structural foundation organizing components into decoupled, modular responsibilities.",
      },
      {
        concept: "Execution Flow",
        explanation:
          "The sequential or asynchronous lifecycle governing data movement and state transitions.",
      },
      {
        concept: "Resource Management",
        explanation:
          "Techniques ensuring predictable memory allocation, cleanup, and error boundaries.",
      },
    ],
    keyPoints: [
      "Explicit contracts and interfaces prevent cascading failures across submodules.",
      "Defensive validation at system boundaries shields core business logic.",
      "Continuous monitoring and structured diagnostics expedite root-cause analysis.",
      "Asynchronous pipelines maximize throughput without blocking critical execution paths.",
    ],
    definitions: [
      {
        term: "Invariance",
        definition:
          "A condition or property that remains unchanged throughout a given transformation or algorithm.",
      },
      {
        term: "Scaffolding",
        definition:
          "Progressive pedagogical support provided to learners to facilitate mastery of complex topics.",
      },
    ],
    examples: [
      {
        topic: "Defensive Validation",
        example:
          "Validating incoming payload schemas before processing rather than handling deep nested undefined errors.",
        explanation:
          "Ensures failures happen fast at boundary layers with descriptive diagnostics.",
      },
    ],
    importantFormulas: [
      {
        name: "Amdahl's Law",
        formula: "S_{latency}(s) = \\frac{1}{(1 - p) + \\frac{p}{s}}",
        explanation:
          "Gives the theoretical speedup in latency of the execution of a task at fixed workload.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Assuming implicit global state or unhandled async exceptions.",
        correction: "Use explicit dependency injection and top-level error boundaries.",
        explanation: "Prevents silent background failures that are difficult to reproduce.",
      },
    ],
    practiceQuestions: [
      {
        question: "What is the primary benefit of decoupled modular architecture?",
        options: [
          "Lower memory usage",
          "Independent testability and isolated blast radius",
          "Faster compile times",
          "Automated cloud scaling",
        ],
        answer: "Independent testability and isolated blast radius",
        explanation:
          "Decoupling ensures components can be reasoned about, developed, and tested in isolation without tight couplings.",
        difficulty: "Easy",
      },
    ],
    suggestedStudyTopics: [
      "Advanced System Design Patterns",
      "Distributed Consensus & State Machines",
      "Performance Benchmarking & Profiling",
    ],
  };
};

/**
 * Analyzes extracted document text using Gemini and generates structured study resources.
 *
 * @param {Object} params
 * @param {string} params.documentText - Clean extracted text from PDF/PPT/TXT
 * @param {string} params.filename - Original uploaded file name
 * @param {string} params.fileType - Detected file type (pdf, pptx, txt)
 * @param {string} [params.learnerLevel="Intermediate"] - 'Beginner' | 'Intermediate' | 'Advanced'
 * @param {string} [params.action="study-material"] - Learning action (explain, summary, extract-topics, study-material, quiz, cheatsheet, flashcards, revision-plan, weak-topics)
 * @param {string} [params.apiKey] - Optional custom API key from client
 */
export const analyzeStudyMaterialWithGemini = async ({
  documentText,
  filename,
  fileType,
  learnerLevel = "Intermediate",
  action = "study-material",
  apiKey,
}) => {
  const activeKey = resolveApiKey(apiKey);

  if (!activeKey) {
    const error = new Error(
      "Gemini API key is required. Please set GEMINI_API_KEY in server/.env or configure your key."
    );
    error.status = 400;
    error.code = "MISSING_API_KEY";
    throw error;
  }

  if (activeKey === "DEMO_MODE") {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("Demo mode is disabled in production. Please configure a valid Gemini API key.");
      error.status = 401;
      error.code = "INVALID_API_KEY";
      throw error;
    }
    return generateDemoMaterialAnalysis(filename, learnerLevel);
  }

  const levelGuidance = {
    Beginner:
      "Explain concepts with clear, approachable language and intuitive analogies. Avoid unnecessary jargon; define all technical terms immediately.",
    Intermediate:
      "Provide balanced explanations using standard academic and professional terminology with structured conceptual clarity.",
    Advanced:
      "Deliver rigorous, in-depth technical analysis focusing on nuanced mechanics, architectural trade-offs, edge cases, and formal precision.",
  }[learnerLevel] || "Provide balanced explanations with structured conceptual clarity.";

  const actionGuidance = {
    explain:
      "PRIMARY ACTION GOAL: Deep pedagogical explanation. Break down all complex concepts into intuitive, approachable analogies and step-by-step clarity. Explain the 'why' and 'how' behind every mechanism in the document.",
    summary:
      "PRIMARY ACTION GOAL: High-yield executive summary. Condense the document into concise key takeaways, essential insights, core principles, and direct summaries without unnecessary fluff.",
    "extract-topics":
      "PRIMARY ACTION GOAL: Topic breakdown & curriculum roadmap. Identify and categorize every major topic, subtopic, prerequisite dependency, and overarching theme in logical sequential order.",
    "study-material":
      "PRIMARY ACTION GOAL: Comprehensive study guide & knowledge base. Generate key concepts, core points, precise definitions, formulas, practical examples, and common traps.",
    quiz:
      "PRIMARY ACTION GOAL: Self-assessment diagnostic quiz. Generate high-yield conceptual and application-based practice questions with detailed diagnostic explanations.",
    cheatsheet:
      "PRIMARY ACTION GOAL: Fast revision cheatsheet. Maximize density of essential formulas, definitions, key rules, and high-yield summary points for quick exam-day review.",
    flashcards:
      "PRIMARY ACTION GOAL: Flashcard & spaced repetition concepts. Focus heavily on key terms, definitions, formulas, and distinct core principles.",
    "revision-plan":
      "PRIMARY ACTION GOAL: Structured revision strategy. Highlight the highest-yield topics, common misconceptions, and recommended study sequence.",
    "weak-topics":
      "PRIMARY ACTION GOAL: Identifying potential pitfall areas and complex concepts that students typically find difficult.",
  }[action] || "PRIMARY ACTION GOAL: Comprehensive structured study guide generation.";

  const prompt = `You are PadhAI's master academic research specialist and pedagogical analyst.
Your task is to analyze the provided study material document and produce an exceptional, rigorous study guide.

${actionGuidance}

LEARNER CALIBRATION:
${levelGuidance}

ANALYSIS INSTRUCTIONS:
1. Grounding: All extracted topics, concepts, definitions, and questions must be strictly grounded in the document content provided. Do not invent unrelated concepts.
2. Structure: Return ONLY a valid JSON object matching the schema below. No markdown formatting outside of JSON string values.
3. Completeness: Ensure all sections are populated with rich, educational detail.

JSON SCHEMA:
{
  "documentTitle": "string (Clean, descriptive title for the document)",
  "summary": "string (Comprehensive 2-4 paragraph structured Markdown summary of the material)",
  "importantTopics": [
    "string (Major topic or thematic module covered in the text)"
  ],
  "keyConcepts": [
    {
      "concept": "string (Name of the core concept)",
      "explanation": "string (Clear, deep pedagogical explanation of how it works and why it matters)"
    }
  ],
  "keyPoints": [
    "string (High-yield takeaway, rule, or critical insight from the material)"
  ],
  "definitions": [
    {
      "term": "string (Exact term, acronym, or vocabulary keyword)",
      "definition": "string (Precise contextual definition as presented in the text)"
    }
  ],
  "examples": [
    {
      "topic": "string (The concept or topic being illustrated)",
      "example": "string (The concrete example, case study, or scenario from the document)",
      "explanation": "string (Why this example demonstrates the principle)"
    }
  ],
  "importantFormulas": [
    {
      "name": "string (Formula or equation name)",
      "formula": "string (LaTeX notation or standard mathematical representation, e.g., 'E = mc^2')",
      "explanation": "string (Explanation of the variables and when to apply this formula)"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "string (Frequent misconception or common error students make)",
      "correction": "string (The correct concept or procedure)",
      "explanation": "string (Why the confusion occurs and how to avoid it)"
    }
  ],
  "practiceQuestions": [
    {
      "question": "string (Thought-provoking conceptual, analytical, or multiple-choice question directly testable from the document)",
      "options": ["string (Option A)", "string (Option B)", "string (Option C)", "string (Option D)"],
      "answer": "string (Correct option or concise answer)",
      "explanation": "string (Clear explanation of why this answer is correct)",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ],
  "suggestedStudyTopics": [
    "string (Suggested next topic, advanced extension, or prerequisite to review next)"
  ]
}

UPLOADED DOCUMENT METADATA:
- File Name: "${filename}"
- File Type: "${fileType}"
- Learner Level: "${learnerLevel}"

EXTRACTED DOCUMENT CONTENT:
"""
${documentText}
"""`;

  return await callGemini({
    prompt,
    responseSchema: studyMaterialAnalysisSchema,
    temperature: 0.4,
    apiKey: activeKey,
  });
};
