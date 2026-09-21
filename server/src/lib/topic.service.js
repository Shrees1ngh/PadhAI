import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveApiKey, cleanAndParseJson } from "./gemini.service.js";
import { ENV } from "../config/env.js";

/**
 * Detect matching visualization type from topic string
 */
export const detectVisualizationType = (topic = "") => {
  const t = topic.toLowerCase().trim();
  if (/\b(bst|binary search tree)\b/i.test(t)) return "bst";
  if (/\b(binary tree|avl tree|red black tree|tree traversal|binary trees)\b/i.test(t)) return "binary-tree";
  if (/\b(linked list|singly linked|doubly linked|circular linked list|linked lists)\b/i.test(t)) return "linked-list";
  if (/\b(stack|stacks|call stack|lifo)\b/i.test(t)) return "stack";
  if (/\b(queue|queues|priority queue|fifo|deque|circular queue)\b/i.test(t)) return "queue";
  if (/\b(sort|sorting|bubble sort|quick sort|merge sort|insertion sort|selection sort)\b/i.test(t)) return "sorting";
  if (/\b(graph|graphs|bfs|dfs|dijkstra|shortest path|breadth first search|depth first search)\b/i.test(t)) return "graph";
  if (/\b(array|arrays|dynamic array|matrix|2d array)\b/i.test(t)) return "array";
  return "none";
};

/**
 * Generate comprehensive, structured Quick Learn topic content with Gemini
 */
export const generateQuickLearnContentWithGemini = async ({
  topic,
  level = "Beginner",
  apiKey,
}) => {
  const activeKey = resolveApiKey(apiKey);
  const detectedVis = detectVisualizationType(topic);

  if (!activeKey) {
    const error = new Error(
      "Gemini API key is required. Please set GEMINI_API_KEY in server/.env or configure it in settings."
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
    return generateDemoQuickLearnContent({ topic, level, visualizationType: detectedVis });
  }

  const prompt = `You are PadhAI's master educational AI tutor.
Generate an engaging, structured, and pedagogical learning guide for the topic: "${topic}".
TARGET AUDIENCE: ${level} level student.

PRIORITIZE:
- Crystal-clear beginner-friendly intuitive explanations
- Real-life relatable analogies (e.g. library books, kitchen queues, family trees)
- Concrete real-world applications (Netflix, Uber, Google, Stripe, game engines)
- Step-by-step breakdown
- Clear code/practical examples with explanation
- Common beginner mistakes and misconceptions
- Concise actionable takeaways

Return STRICT valid JSON conforming to this schema without Markdown fence wrappers:
{
  "title": "${topic}",
  "topic": "${topic}",
  "level": "${level}",
  "estimatedReadingTime": "6 mins",
  "visualizationType": "${detectedVis}",
  "simpleExplanation": "string (A clear, intuitive Markdown explanation calibrated for a ${level} learner. Avoid overwhelming jargon without defining it)",
  "whyItMatters": "string (Markdown explaining why mastering this concept is essential for software engineering and problem solving)",
  "realLifeAnalogy": "string (Markdown everyday analogy that creates an instant mental model)",
  "realWorldApplications": [
    "string (Application 1 at top tech companies or systems)",
    "string (Application 2)"
  ],
  "coreConcepts": [
    { "title": "Concept 1", "description": "Brief explanation" },
    { "title": "Concept 2", "description": "Brief explanation" },
    { "title": "Concept 3", "description": "Brief explanation" }
  ],
  "stepByStepBreakdown": [
    { "step": 1, "title": "Step title", "explanation": "Detailed breakdown" },
    { "step": 2, "title": "Step title", "explanation": "Detailed breakdown" },
    { "step": 3, "title": "Step title", "explanation": "Detailed breakdown" }
  ],
  "examples": [
    {
      "language": "cpp",
      "code": "code snippet string",
      "explanation": "What this code does line by line"
    }
  ],
  "commonMistakes": [
    "string (Common misconception or trap and how to avoid it)",
    "string (Mistake 2)"
  ],
  "importantTakeaways": [
    "string (Core rule of thumb 1)",
    "string (Core rule of thumb 2)",
    "string (Core rule of thumb 3)"
  ],
  "miniQuiz": [
    {
      "question": "string (Conceptual question)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "Why this option is correct"
    },
    {
      "question": "string (Question 2)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 1,
      "explanation": "Why this option is correct"
    }
  ]
}`;

  let rawOutput = "";

  try {
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const response = await ai.models.generateContent({
        model: ENV.GEMINI_MODEL || "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      rawOutput = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || "";
    } catch (sdkErr) {
      console.warn("Primary GenAI SDK fallback in topic service:", sdkErr.message);
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: ENV.GEMINI_MODEL || "gemini-3.6-flash",
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      });
      const result = await model.generateContent(prompt);
      rawOutput = result.response.text();
    }

    const parsed = cleanAndParseJson(rawOutput);
    if (!parsed.visualizationType || parsed.visualizationType === "none") {
      parsed.visualizationType = detectedVis;
    }
    return parsed;
  } catch (err) {
    console.error("Gemini Quick Learn generation error:", err.message);
    if (
      err.message?.includes("429") ||
      err.message?.includes("Quota exceeded") ||
      err.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      const rateLimitErr = new Error(
        "Gemini API daily quota reached. Please add your Gemini API Key in Settings to generate real-time learning guides."
      );
      rateLimitErr.status = 429;
      rateLimitErr.code = "QUOTA_EXCEEDED";
      throw rateLimitErr;
    }
    throw new Error(err.message || "Failed to generate learning material for this topic. Please try again.");
  }
};

/**
 * Rich offline/demo generator for developer demo mode only
 */
export const generateDemoQuickLearnContent = ({ topic = "Topic Overview", level = "Beginner", visualizationType = "none" }) => {
  const vis = visualizationType || detectVisualizationType(topic);
  const topicName = topic.trim() || "Topic Overview";

  return {
    isDemo: true,
    title: topicName,
    topic: topicName,
    level,
    estimatedReadingTime: "6 mins",
    visualizationType: vis,
    simpleExplanation: `**${topicName}** is a core subject area in software engineering and computational systems. ` +
      `Mastering ${topicName} provides clear mental models, structural understanding, and practical intuition at the ${level} level.`,
    whyItMatters: `Understanding **${topicName}** enables developers and engineers to make informed architectural decisions, optimize execution pathways, and write robust, production-ready software.`,
    realLifeAnalogy: `Think of **${topicName}** like a well-organized workflow or system pipeline where each component has a defined role, strict boundaries, and predictable interactions.`,
    realWorldApplications: [
      `**Large-scale Backend Systems**: Applied in distributed services and production APIs.`,
      `**Performance Optimization**: Crucial for reducing latency, memory footprint, and redundant operations.`,
      `**Engineering Interviews**: High-frequency conceptual and problem-solving area.`
    ],
    coreConcepts: [
      {
        title: "Foundational Principles",
        description: `Core properties and rules governing ${topicName}.`
      },
      {
        title: "Operational Mechanics",
        description: `How components interact, transition states, and handle edge cases.`
      },
      {
        title: "System Tradeoffs",
        description: `Balancing performance, complexity, and maintainability.`
      }
    ],
    stepByStepBreakdown: [
      {
        step: 1,
        title: "1. Core Initialization",
        explanation: `Set up the fundamental state, invariants, and initial conditions for ${topicName}.`
      },
      {
        step: 2,
        title: "2. Execution & Transformation",
        explanation: "Process inputs through the algorithm or architectural workflow step by step."
      },
      {
        step: 3,
        title: "3. Result Evaluation & Cleanup",
        explanation: "Validate the final output against expected constraints and release allocated resources."
      }
    ],
    examples: [
      {
        language: "javascript",
        code: `// Practical demonstration for ${topicName}\nfunction demonstrateConcept() {\n  console.log("Executing ${topicName} workflow...");\n  return { status: "success", topic: "${topicName}" };\n}\n\nconst result = demonstrateConcept();\nconsole.log(result);`,
        explanation: `Demonstrates the core execution pattern for ${topicName}.`
      }
    ],
    commonMistakes: [
      `**Overlooking Boundary Conditions**: Failing to validate edge cases and empty inputs.`,
      `**Ignoring Complexity Invariants**: Not considering time and space tradeoffs under scale.`
    ],
    importantTakeaways: [
      `Always understand the fundamental invariant before implementing optimizations.`,
      `Ensure boundary schema validation is enforced at system interfaces.`,
      `Practice active recall to reinforce long-term understanding.`
    ],
    miniQuiz: [
      {
        question: `What is a primary consideration when working with ${topicName}?`,
        options: [
          "Enforcing correctness and handling edge cases systematically",
          "Hardcoding all values without validation",
          "Ignoring time and space constraints",
          "Running all operations synchronously on the main thread"
        ],
        correctOptionIndex: 0,
        explanation: `Correctness, clean boundaries, and systematic edge case handling are vital when working with ${topicName}.`
      }
    ]
  };
};
