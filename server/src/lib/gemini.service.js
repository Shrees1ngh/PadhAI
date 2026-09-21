import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
      throw new Error(`Failed to parse AI response into valid JSON: ${repairErr.message}`);
    }
  }
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
      console.warn("Primary GenAI SDK call fell back, trying generative-ai sdk:", sdkErr.message);
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: ENV.GEMINI_MODEL || "gemini-3.6-flash",
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      });
      const result = await model.generateContent(prompt);
      rawOutput = result.response.text();
    }

    const parsedJson = cleanAndParseJson(rawOutput);
    const normalizedOutline = normalizeCourseOutline(parsedJson, Number(durationDays) || 10);

    // Validate with Zod
    const validatedOutline = courseOutlineSchema.parse(normalizedOutline);
    return validatedOutline;
  } catch (error) {
    console.error("Course generation failed:", error.message);
    if (
      error.message?.includes("429") ||
      error.message?.includes("Quota exceeded") ||
      error.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      const rateLimitErr = new Error(
        "Gemini API rate limit or daily quota reached (20/20 requests). Please add your personal Gemini API key in Settings to generate 100% real-time courses."
      );
      rateLimitErr.status = 429;
      rateLimitErr.code = "QUOTA_EXCEEDED";
      throw rateLimitErr;
    }
    if (error.name === "ZodError" || error.issues) {
      const issues = error.issues || error.errors || [];
      throw new Error(`AI generated outline did not match expected structure: ${issues.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
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

  let rawOutput = "";

  try {
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const response = await ai.models.generateContent({
        model: ENV.GEMINI_MODEL || "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      rawOutput = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || "";
    } catch (sdkErr) {
      console.warn("GenAI SDK modification fallback:", sdkErr.message);
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: ENV.GEMINI_MODEL || "gemini-3.6-flash",
        generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
      });
      const result = await model.generateContent(prompt);
      rawOutput = result.response.text();
    }

    const parsedJson = cleanAndParseJson(rawOutput);
    const normalizedOutline = normalizeCourseOutline(parsedJson, targetDays);
    const validatedOutline = courseOutlineSchema.parse(normalizedOutline);
    return validatedOutline;
  } catch (error) {
    console.error("Course modification failed:", error.message);
    if (error.name === "ZodError" || error.issues) {
      const issues = error.issues || error.errors || [];
      throw new Error(`AI modified outline did not match expected structure: ${issues.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
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

  return normalizeCourseOutline(rawOutline, duration);
};

const modifyDemoOutline = ({ currentOutline, modifications, setupParams }) => {
  const targetDays = setupParams.durationDays || currentOutline.durationDays || 10;
  const updated = {
    ...currentOutline,
    title: `${currentOutline.title} (Updated)`,
    description: `${currentOutline.description} • Adjusted based on feedback: "${modifications}"`,
  };
  return normalizeCourseOutline(updated, targetDays);
};
