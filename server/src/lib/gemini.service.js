import { GoogleGenAI } from "@google/genai";
import { jsonrepair } from "jsonrepair";
import { courseOutlineSchema, normalizeCourseOutline } from "../modules/courses/course.validator.js";
import { ENV } from "../config/env.js";

// Helper to retrieve active API Key
export const resolveApiKey = (customKey) => {
  return customKey?.trim() || ENV.GEMINI_API_KEY?.trim() || "";
};

// Defensive JSON cleanup and parsing
export const cleanAndParseJson = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response received from AI model");
  }

  // Strip markdown code fences if present
  let cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Try JSON.parse first
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // If malformed, attempt repair with jsonrepair
    try {
      const repaired = jsonrepair(cleaned);
      return JSON.parse(repaired);
    } catch (repairErr) {
      console.error("JSON repair failed on AI text:", cleaned.slice(0, 300));
      const parseErr = new Error(`Failed to parse AI response into valid JSON: ${repairErr.message}`);
      parseErr.status = 502;
      parseErr.code = "AI_OUTPUT_INVALID";
      throw parseErr;
    }
  }
};

/**
 * Standard unified helper to call Gemini using @google/genai SDK.
 * Retries at most 1 time, strictly for 5xx server errors or JSON-parse failures.
 * NEVER retries on 429 (Rate Limit / Quota Exceeded) or 401 (Invalid API Key).
 *
 * @param {Object} options
 * @param {string} options.prompt
 * @param {Object} [options.responseSchema] - Optional Zod schema to parse/validate against
 * @param {number} [options.temperature=0.7]
 * @param {string} [options.systemInstruction]
 * @param {string} [options.apiKey]
 * @param {string} [options.model]
 * @param {boolean} [options.jsonMode=true]
 */
export const callGemini = async ({
  prompt,
  responseSchema,
  temperature = 0.7,
  systemInstruction,
  apiKey,
  model,
  jsonMode = true,
}) => {
  const activeKey = resolveApiKey(apiKey);

  if (!activeKey) {
    const error = new Error(
      "Gemini API key is required. Please add GEMINI_API_KEY in server/.env or configure your personal API key in Settings."
    );
    error.status = 400;
    error.code = "MISSING_API_KEY";
    throw error;
  }

  const ai = new GoogleGenAI({ apiKey: activeKey });
  const configuredModel = model || ENV.GEMINI_MODEL || "gemini-2.5-flash";

  // Fallback candidate models supported by @google/genai SDK
  const candidateModels = [
    configuredModel,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash-lite",
  ].filter((m, i, arr) => Boolean(m) && arr.indexOf(m) === i);

  const config = {
    temperature,
  };

  if (jsonMode) {
    config.responseMimeType = "application/json";
  }

  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  let lastError = null;

  for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
    const currentModel = candidateModels[mIdx];

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: prompt,
          config,
        });

        const rawOutput =
          response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          response?.text ||
          "";

        if (jsonMode) {
          const parsed = cleanAndParseJson(rawOutput);
          if (responseSchema && typeof responseSchema.parse === "function") {
            return responseSchema.parse(parsed);
          }
          return parsed;
        }

        return rawOutput;
      } catch (error) {
        lastError = error;

        // Check for 429 (Quota / Rate Limit) - NEVER RETRY
        const is429 =
          error.status === 429 ||
          error.message?.includes("429") ||
          error.message?.includes("Quota exceeded") ||
          error.message?.includes("RESOURCE_EXHAUSTED") ||
          error.code === "QUOTA_EXCEEDED";

        if (is429) {
          const rateLimitErr = new Error(
            "Gemini API rate limit or daily quota reached. Please add your personal Gemini API key in Settings to continue."
          );
          rateLimitErr.status = 429;
          rateLimitErr.code = "QUOTA_EXCEEDED";
          throw rateLimitErr;
        }

        // Check for 401 (Invalid API Key) - NEVER RETRY
        const is401 =
          error.status === 401 ||
          error.message?.includes("API key not valid") ||
          error.message?.includes("API_KEY_INVALID") ||
          error.message?.includes("401") ||
          error.code === "INVALID_API_KEY";

        if (is401) {
          const keyErr = new Error("Invalid Gemini API Key. Please verify your key in Settings.");
          keyErr.status = 401;
          keyErr.code = "INVALID_API_KEY";
          throw keyErr;
        }

        // Check for Zod / Schema validation error - DO NOT RETRY SAME MODEL
        if (error.name === "ZodError" || error.issues) {
          const issues = error.issues || error.errors || [];
          const valErr = new Error(
            `AI output did not match expected structure: ${issues.map((e) => e.message).join(", ")}`
          );
          valErr.status = 502;
          valErr.code = "AI_OUTPUT_INVALID";
          throw valErr;
        }

        // Check if eligible for retry: 5xx server errors, 503 high demand, overloaded, or JSON parse failure
        const is5xx =
          (error.status >= 500 && error.status < 600) ||
          error.message?.includes("500") ||
          error.message?.includes("503") ||
          error.message?.includes("UNAVAILABLE") ||
          error.message?.includes("high demand") ||
          error.message?.includes("Internal server error") ||
          error.message?.includes("Service Unavailable") ||
          error.message?.includes("overloaded");

        const isJsonParseError =
          error.code === "AI_OUTPUT_INVALID" ||
          error.message?.includes("Failed to parse AI response into valid JSON") ||
          error instanceof SyntaxError ||
          error.name === "SyntaxError";

        if (is5xx || isJsonParseError) {
          console.warn(
            `callGemini transient error on model "${currentModel}" (attempt ${attempt}/2):`,
            error.message?.slice(0, 200)
          );
          await new Promise((res) => setTimeout(res, attempt * 600));
          // If on attempt 2, loop continues to next candidate model
        } else {
          // Unrecognized error, break inner loop to try next model or fail
          break;
        }
      }
    }
  }

  // Extract clean message if Google returned a raw JSON error string
  let finalMessage = lastError?.message || "Google AI service is currently unavailable. Please try again.";
  if (typeof finalMessage === "string" && finalMessage.includes('{"error":')) {
    try {
      const match = finalMessage.match(/\{"error":.*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed?.error?.message) {
          finalMessage = parsed.error.message;
        }
      }
    } catch {}
  }

  const finalError = new Error(finalMessage);
  finalError.status = lastError?.status || 503;
  finalError.code = lastError?.code || "AI_SERVICE_UNAVAILABLE";
  throw finalError;
};

/**
 * Generate a new structured day-wise course outline adhering to Bloom's Taxonomy.
 */
export const generateCourseOutlineWithGemini = async ({
  topic,
  learningGoal,
  currentLevel,
  durationDays = 10,
  dailyStudyTime,
  learningPreference,
  apiKey,
}) => {
  const activeKey = resolveApiKey(apiKey);

  if (!activeKey) {
    const error = new Error(
      "Gemini API key is required. Please add GEMINI_API_KEY in server/.env or provide your key in the Course Setup interface."
    );
    error.status = 400;
    error.code = "MISSING_API_KEY";
    throw error;
  }

  // Allow developer demo mode for end-to-end verification without consumption
  if (activeKey === "DEMO_MODE") {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("Demo mode is disabled in production. Please configure a valid Gemini API key.");
      error.status = 401;
      error.code = "INVALID_API_KEY";
      throw error;
    }
    return generateDemoOutline({
      topic,
      learningGoal,
      currentLevel,
      durationDays: Number(durationDays) || 10,
      dailyStudyTime,
      learningPreference,
    });
  }

  const prompt = `You are PadhAI's master curriculum architect, specializing in instructional design and cognitive scaffolding.

Design a comprehensive, structured, DAY-BY-DAY course outline on the following topic strictly adhering to Bloom's Taxonomy:
- Topic: "${topic}"
- Primary Learning Goal: "${learningGoal}"
- Learner's Current Level: ${currentLevel}
- Total Course Duration: EXACTLY ${durationDays} DAYS (${dailyStudyTime} per day)
- Learning Style & Preference: ${learningPreference}

CRITICAL DURATION & DAY-WISE RULES:
1. The course MUST contain an explicit day-by-day plan of EXACTLY ${durationDays} days in the "days" array.
2. The "days" array MUST have exactly ${durationDays} elements, numbered day 1 to day ${durationDays}.
3. Every single day must have a distinct pedagogical theme, clear daily learning objective, and 1 to 3 focused lessons.
4. Also group the days logically into 3 to 6 progressive modules in the "modules" array (Foundations -> Implementation & Mechanics -> Advanced Architecture & Mastery).
5. Output MUST be valid JSON only without markdown fences, prologue, or epilogue.

EXACT JSON SCHEMA TO SATISFY:
{
  "title": "string (engaging, precise course title)",
  "description": "string (comprehensive overview of the curriculum and pedagogical approach)",
  "learningObjectives": [
    "string (actionable outcome starting with an active verb, e.g., 'Analyze...', 'Build...', 'Evaluate...')"
  ],
  "estimatedDuration": "${durationDays} Days • ${dailyStudyTime}/day",
  "durationDays": ${durationDays},
  "days": [
    {
      "day": 1,
      "title": "string (e.g. 'Day 1: Introduction to Architecture')",
      "learningObjective": "string (daily core outcome)",
      "moduleTitle": "string (e.g. 'Module 1: Foundations')",
      "lessons": [
        {
          "title": "string (clear lesson title)",
          "learningObjective": "string (specific competency learner gains)",
          "estimatedMinutes": 30
        }
      ]
    }
  ],
  "modules": [
    {
      "title": "string (e.g., 'Module 1: Foundations & Architecture')",
      "description": "string (scope and cognitive focus of this module)",
      "estimatedMinutes": number,
      "lessons": [
        {
          "title": "string (clear lesson title)",
          "learningObjective": "string (specific competency learner gains)"
        }
      ]
    }
  ]
}`;

  const parsedJson = await callGemini({
    prompt,
    temperature: 0.7,
    apiKey: activeKey,
  });

  const normalizedOutline = normalizeCourseOutline(parsedJson, Number(durationDays) || 10);
  return courseOutlineSchema.parse(normalizedOutline);
};

/**
 * Modify and regenerate an existing course outline based on user feedback.
 */
export const modifyCourseOutlineWithGemini = async ({
  currentOutline,
  modifications,
  setupParams,
  apiKey,
}) => {
  const activeKey = resolveApiKey(apiKey);
  const targetDays = setupParams.durationDays || currentOutline.durationDays || 10;

  if (!activeKey) {
    const error = new Error(
      "Gemini API key is required. Please add GEMINI_API_KEY in server/.env or provide your key in the interface."
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
    return modifyDemoOutline({ currentOutline, modifications, setupParams });
  }

  const prompt = `You are PadhAI's master curriculum architect.
The user has reviewed their existing course outline and requested specific modifications.

ORIGINAL COURSE PARAMETERS:
- Topic: "${setupParams.topic}"
- Learning Goal: "${setupParams.learningGoal}"
- Level: ${setupParams.currentLevel}
- Duration: EXACTLY ${targetDays} days (${setupParams.dailyStudyTime}/day)
- Preference: ${setupParams.learningPreference}

CURRENT COURSE OUTLINE:
${JSON.stringify(currentOutline, null, 2)}

USER REQUESTED MODIFICATIONS:
"${modifications}"

INSTRUCTIONS:
1. Update the outline to carefully incorporate ALL requested modifications while strictly keeping duration at EXACTLY ${targetDays} days.
2. The "days" array MUST contain exactly ${targetDays} elements (Day 1 through Day ${targetDays}).
3. Return ONLY the updated valid JSON object matching the schema.
4. No HTML, no markdown code fences, no introductory or concluding chatter.

EXACT JSON SCHEMA:
{
  "title": "string",
  "description": "string",
  "learningObjectives": ["string"],
  "estimatedDuration": "${targetDays} Days • ${setupParams.dailyStudyTime}/day",
  "durationDays": ${targetDays},
  "days": [
    {
      "day": number,
      "title": "string",
      "learningObjective": "string",
      "moduleTitle": "string",
      "lessons": [
        {
          "title": "string",
          "learningObjective": "string",
          "estimatedMinutes": number
        }
      ]
    }
  ],
  "modules": [
    {
      "title": "string",
      "description": "string",
      "estimatedMinutes": number,
      "lessons": [
        {
          "title": "string",
          "learningObjective": "string"
        }
      ]
    }
  ]
}`;

  const parsedJson = await callGemini({
    prompt,
    temperature: 0.6,
    apiKey: activeKey,
  });

  const normalizedOutline = normalizeCourseOutline(parsedJson, targetDays);
  return courseOutlineSchema.parse(normalizedOutline);
};

/**
 * Pedagogical Bloom's Taxonomy generator for Demo Mode (zero-cost offline testing).
 */
const generateDemoOutline = ({
  topic,
  learningGoal,
  currentLevel,
  durationDays = 10,
  dailyStudyTime,
  learningPreference,
}) => {
  const days = [];
  const duration = Number(durationDays) || 10;
  const targetModuleCount = Math.max(3, Math.min(6, Math.ceil(duration / 3)));

  const dayThemes = [
    { title: "Core Foundations & Architectural Mental Models", focus: "Recall & Understand" },
    { title: "Environment Configuration & Dependency Setup", focus: "Remember" },
    { title: "Essential Syntax, Lifecycles & State Management", focus: "Understand" },
    { title: "Primary Algorithms & Procedural Execution", focus: "Apply" },
    { title: "Hands-on Implementation & Workflows", focus: "Apply" },
    { title: "Debugging Patterns, Gotchas & Boundary Cases", focus: "Analyze" },
    { title: "Performance Profiling & Latency Optimization", focus: "Analyze" },
    { title: "Security Hardening & Best Practices", focus: "Evaluate" },
    { title: "Architectural Tradeoffs & System Design", focus: "Evaluate" },
    { title: "Capstone Project Architecture & Deployment", focus: "Create" },
  ];

  for (let d = 1; d <= duration; d++) {
    const themeIdx = (d - 1) % dayThemes.length;
    const theme = dayThemes[themeIdx];
    const modNum = Math.min(targetModuleCount, Math.ceil((d / duration) * targetModuleCount));

    days.push({
      day: d,
      title: `Day ${d}: ${theme.title}`,
      learningObjective: `Master ${theme.title.toLowerCase()} for ${topic} with focus on "${learningGoal}"`,
      moduleTitle: `Module ${modNum}: Stage ${modNum} Progression`,
      lessons: [
        {
          title: `Lesson ${d}.1: Deep Dive on ${theme.title}`,
          learningObjective: `Understand mechanisms and apply best practices in ${topic}`,
          estimatedMinutes: 30,
        },
        {
          title: `Lesson ${d}.2: Practical Implementation & Analysis`,
          learningObjective: `Build hands-on exercises and analyze edge cases`,
          estimatedMinutes: 30,
        },
      ],
    });
  }

  const rawOutline = {
    title: `Mastering ${topic}: Complete ${duration}-Day Roadmap`,
    description: `A structured ${duration}-day curriculum for ${topic} engineered using Bloom's Taxonomy. Tailored for ${currentLevel} learners aiming for "${learningGoal}" with ${dailyStudyTime}/day pace.`,
    learningObjectives: [
      `Recall and explain foundational mental models of ${topic}`,
      `Apply core mechanisms to solve technical challenges`,
      `Analyze performance tradeoffs and debug complex failure scenarios`,
      `Synthesize learned concepts into a complete capstone project`,
    ],
    estimatedDuration: `${duration} Days • ${dailyStudyTime || "2 hours"}/day`,
    durationDays: duration,
    days,
    modules: [],
  };

  return { ...normalizeCourseOutline(rawOutline, duration), isDemo: true };
};

const modifyDemoOutline = ({ currentOutline, modifications, setupParams }) => {
  const targetDays = setupParams.durationDays || currentOutline.durationDays || 10;
  const updated = {
    ...currentOutline,
    title: `${currentOutline.title} (Updated)`,
    description: `${currentOutline.description} • Adjusted based on feedback: "${modifications}"`,
  };
  return { ...normalizeCourseOutline(updated, targetDays), isDemo: true };
};
