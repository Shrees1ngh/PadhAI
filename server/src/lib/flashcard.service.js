import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanAndParseJson, resolveApiKey } from "./gemini.service.js";
import { generatedFlashcardsSchema } from "../modules/flashcards/flashcard.validator.js";

/**
 * Demo flashcards generator for developer demo mode.
 */
const generateDemoFlashcards = ({ lessonTitle }) => {
  return {
    cards: [
      {
        question: `What is the primary architectural goal of ${lessonTitle}?`,
        answer: "To ensure modular separation of concerns, high maintainability, and testable isolated execution paths.",
        concept: "Architecture & Design",
        difficulty: "Easy",
      },
      {
        question: "How does boundary schema validation protect system stability?",
        answer: "It catches malformed or malicious payloads at ingestion, preventing undefined property errors deeper in service logic.",
        concept: "Defensive Validation",
        difficulty: "Easy",
      },
      {
        question: "What is the difference between synchronous blocking vs asynchronous non-blocking operations?",
        answer: "Synchronous operations pause the execution thread until completion, while asynchronous operations delegate tasks to the event loop, maintaining high system throughput.",
        concept: "Execution Model",
        difficulty: "Medium",
      },
      {
        question: "Why should API keys and private secrets remain strictly on the backend?",
        answer: "To prevent unauthorized credential extraction, quota exhaustion, and compromise from client-side bundle inspection.",
        concept: "Security & Secrets",
        difficulty: "Medium",
      },
      {
        question: "What constitutes an idempotent HTTP/API operation?",
        answer: "An operation whose outcome on system state is identical regardless of whether it is executed once or multiple consecutive times (e.g., GET, PUT, DELETE).",
        concept: "Idempotence",
        difficulty: "Medium",
      },
      {
        question: "How should an application handle database downtime gracefully?",
        answer: "By returning explicit 503 status codes with clear diagnostic flags (e.g. mongoUnavailable: true) without creating false persistence.",
        concept: "Fault Tolerance",
        difficulty: "Medium",
      },
      {
        question: "What is Bloom's Taxonomy progression in instructional design?",
        answer: "A hierarchical framework ordering cognitive skills from lower to higher order: Remember -> Understand -> Apply -> Analyze -> Evaluate -> Create.",
        concept: "Pedagogical Scaffolding",
        difficulty: "Hard",
      },
      {
        question: "Under the CAP theorem, how does network partitioning affect distributed consistency vs availability?",
        answer: "When network partitioning occurs, the system must either sacrifice consistency to remain available or sacrifice availability to guarantee atomic linear consistency.",
        concept: "Distributed Systems",
        difficulty: "Hard",
      },
      {
        question: "Why is jsonrepair utilized as a secondary fallback rather than a primary parser?",
        answer: "Standard JSON.parse ensures maximum performance and specification adherence; jsonrepair provides resilient error-recovery only when LLM responses contain subtle formatting quirks.",
        concept: "Resilient Parsing",
        difficulty: "Medium",
      },
      {
        question: "How does spaced repetition improve long-term knowledge retention?",
        answer: "By strategically scheduling recall intervals just before memory decay occurs, strengthening neural synaptic pathways according to the forgetting curve.",
        concept: "Cognitive Retention",
        difficulty: "Hard",
      },
    ],
  };
};

/**
 * Generate exactly 10 AI-powered flashcards using Gemini.
 *
 * @param {Object} params
 * @param {string} params.lessonTitle
 * @param {string} params.lessonContent
 * @param {string} [params.courseTopic]
 * @param {string} [params.currentLevel="Intermediate"]
 * @param {string} [params.apiKey]
 */
export const generateFlashcardsWithGemini = async ({
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
    return generateDemoFlashcards({ lessonTitle });
  }

  const prompt = `You are PadhAI's master Spaced Repetition Flashcard Designer.

TASK:
Create a deck of EXACTLY 10 high-yield FLASHCARDS on "${lessonTitle}"${
    courseTopic ? ` in the context of "${courseTopic}"` : ""
  } for a learner at the **${currentLevel}** level.

FLASHCARD DESIGN CRITERIA:
1. Grounding: All questions and answers must be strictly grounded in the provided source material. Do not introduce outside or unverified facts.
2. High Yield: Focus questions on foundational concepts, key terms, critical mechanisms, formulas, and common pitfalls.
3. Difficulty Distribution: Provide a balanced progression of difficulties:
   - 3 Easy cards (foundational terms, definitions, direct recall)
   - 4 Medium cards (mechanisms, comparisons, application scenarios)
   - 3 Hard cards (edge cases, architectural tradeoffs, deep synthesis)
4. Clarity: Front of the card (question) must be clear, concise, and focused on one specific concept. Back of the card (answer) must be direct, definitive, and easy to memorize.
5. No Duplicates: Each card must test a distinct concept or mechanism.
6. Format: Output MUST be valid JSON matching the schema below.

JSON SCHEMA:
{
  "cards": [
    {
      "question": "string (Clear, targeted prompt or question)",
      "answer": "string (Concise, accurate 1-3 sentence answer)",
      "concept": "string (The core concept category e.g., 'Consensus Protocol', 'Time Complexity', etc.)",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
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
          temperature: 0.35,
        },
      });

      rawOutput =
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        response?.text ||
        "";
    } catch (sdkErr) {
      console.warn(
        "Primary @google/genai call failed for flashcards, falling back to @google/generative-ai:",
        sdkErr.message
      );
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.35,
        },
      });
      const result = await model.generateContent(prompt);
      rawOutput = result.response.text();
    }

    const parsed = cleanAndParseJson(rawOutput);
    return generatedFlashcardsSchema.parse(parsed);
  } catch (error) {
    console.error("Flashcards generation failed:", error.message);
    if (error.name === "ZodError") {
      throw new Error(
        `Gemini generated flashcards did not match the expected schema: ${error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
};
