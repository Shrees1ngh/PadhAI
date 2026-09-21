import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanAndParseJson, resolveApiKey } from "./gemini.service.js";
import { studyMaterialAnalysisSchema } from "../modules/study-materials/studyMaterial.validator.js";
import { ENV } from "../config/env.js";

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
      "PRIMARY ACTION GOAL: Syllabus & topic extraction. Clearly delineate every major topic, core subtopic, domain hierarchy, and scope boundaries present in the material.",
    "study-material":
      "PRIMARY ACTION GOAL: Comprehensive textbook-grade study notes. Provide thorough explanations, formal definitions, concrete examples, formulas, common pitfalls, and review questions.",
    quiz:
      "PRIMARY ACTION GOAL: Practice & Diagnostic Assessment. Generate challenging, high-yield practice questions with detailed conceptual explanations for each option, highlighting common traps.",
    cheatsheet:
      "PRIMARY ACTION GOAL: Ultra-dense quick reference revision sheet. Focus heavily on concise definitions, formulas, syntax, rules, and memory aids suitable for rapid last-minute review.",
    flashcards:
      "PRIMARY ACTION GOAL: Active recall & spaced repetition synthesis. Focus on atomic concept-definition pairs, key questions, and high-yield facts formatted for flashcard learning.",
    "revision-plan":
      "PRIMARY ACTION GOAL: Structured revision roadmap. Organize the topics into a prioritized learning plan, highlighting prerequisites, critical high-yield modules, and review milestones.",
    "weak-topics":
      "PRIMARY ACTION GOAL: Weak & Stumbling Block Identification. Focus on difficult conceptual bottlenecks, frequent misconceptions, subtle edge cases, and high-stakes exam pitfalls.",
  }[action] || "PRIMARY ACTION GOAL: Generate high-yield structured learning resources.";

  const prompt = `You are PadhAI's master Study Material Analyzer & Academic Knowledge Synthesizer.

TASK:
Analyze the following extracted study material and generate high-yield, structured learning resources for a learner at the **${learnerLevel}** level.

${actionGuidance}

PEDAGOGICAL & EXTRACTION RULES:
1. Grounding: Analyze ONLY the provided document text below. Do NOT invent facts, theories, or details that are not present or directly supported in the source document.
2. Terminology: Preserve the exact terminology, definitions, and mathematical notations used in the uploaded material.
3. Level Adaptation: ${levelGuidance}
4. Action Alignment: Prioritize and emphasize sections corresponding to the user's requested action. Ensure all sections are populated from the document. If a document does not contain explicit formulas or math, provide relevant conceptual formulas or leave importantFormulas as an empty array [].
5. Format: Output MUST be strictly valid JSON matching the schema below without markdown fences, prologue, or explanatory prose.

JSON OUTPUT SCHEMA:
{
  "documentTitle": "string (Concise, accurate title representing the document content or lecture topic)",
  "summary": "string (A rich, well-structured 2 to 4 paragraph synthesis summarizing the core themes, objectives, and conclusions)",
  "importantTopics": [
    "string (Crucial high-level topic or chapter name covered in the text)"
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

  let rawOutput = "";

  try {
    // Primary attempt: @google/genai
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const response = await ai.models.generateContent({
        model: ENV.GEMINI_MODEL || "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      rawOutput =
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        response?.text ||
        "";
    } catch (sdkErr) {
      console.warn(
        "Primary @google/genai call failed for study material analysis, falling back to @google/generative-ai:",
        sdkErr.message
      );
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: ENV.GEMINI_MODEL || "gemini-3.6-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });
      const result = await model.generateContent(prompt);
      rawOutput = result.response.text();
    }

    const parsedJson = cleanAndParseJson(rawOutput);
    const validatedData = studyMaterialAnalysisSchema.parse(parsedJson);
    return validatedData;
  } catch (error) {
    console.error("Study material analysis failed:", error.message);
    if (error.name === "ZodError" || error.issues) {
      const issues = error.issues || error.errors || [];
      throw new Error(
        `Gemini generated study material did not match the expected schema: ${issues
          .map((e) => `${e.path?.join?.(".") || ""}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
};
