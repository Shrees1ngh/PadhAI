import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsonrepair } from "jsonrepair";
import { courseOutlineSchema } from "../modules/courses/course.validator.js";
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
 * Generate a new structured course outline adhering to Bloom's Taxonomy.
 */
export const generateCourseOutlineWithGemini = async ({
  topic,
  learningGoal,
  currentLevel,
  durationDays,
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
      durationDays,
      dailyStudyTime,
      learningPreference,
    });
  }

  // Determine appropriate module count based on duration
  const targetModuleCount = Math.max(3, Math.min(8, Math.round(durationDays / 2) || 4));

  const prompt = `You are PadhAI's master curriculum architect, specializing in instructional design and cognitive scaffolding.

Design a comprehensive, structured course outline on the following topic strictly adhering to the revised Bloom's Taxonomy progression:
- Topic: "${topic}"
- Primary Learning Goal: "${learningGoal}"
- Learner's Current Level: ${currentLevel}
- Total Course Duration: ${durationDays} days (${dailyStudyTime} per day)
- Learning Style & Preference: ${learningPreference}

PEDAGOGICAL INSTRUCTION (BLOOM'S TAXONOMY PROGRESSION):
Structure the course into exactly ${targetModuleCount} progressive modules:
1. Early Modules (Cognitive Level: Remember & Understand): Establish foundational terms, conceptual mental models, core principles, and analogies.
2. Middle Modules (Cognitive Level: Apply & Analyze): Focus on procedural implementation, real-world case analysis, core mechanics, and problem-solving.
3. Final Modules (Cognitive Level: Evaluate & Create): Synthesize knowledge through architectural design, trade-off evaluation, and practical capstone projects matching the learner's goal.

STRICT FORMATTING REQUIREMENTS:
- Output MUST be valid JSON only.
- Do NOT output any HTML tags.
- Do NOT output any markdown blocks, explanations, or prologue text.
- Do NOT output raw backticks.

EXACT JSON SCHEMA TO SATISFY:
{
  "title": "string (engaging, precise course title)",
  "description": "string (comprehensive overview of the curriculum and pedagogical approach)",
  "learningObjectives": [
    "string (actionable outcome starting with an active verb, e.g., 'Analyze...', 'Build...', 'Evaluate...')"
  ],
  "estimatedDuration": "${durationDays} Days • ${dailyStudyTime}/day",
  "modules": [
    {
      "title": "string (e.g., 'Module 1: Foundations & Architecture')",
      "description": "string (scope and cognitive focus of this module)",
      "estimatedMinutes": number (total minutes for this module),
      "lessons": [
        {
          "title": "string (clear lesson title)",
          "learningObjective": "string (specific competency learner gains from this lesson)"
        }
      ]
    }
  ]
}`;

  let rawOutput = "";

  try {
    // Attempt with @google/genai first
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      rawOutput = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || "";
    } catch (sdkErr) {
      console.warn("Primary GenAI SDK call fell back, trying generative-ai sdk:", sdkErr.message);
      // Fallback to @google/generative-ai
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      });
      const result = await model.generateContent(prompt);
      rawOutput = result.response.text();
    }

    const parsedJson = cleanAndParseJson(rawOutput);

    // Validate with Zod
    const validatedOutline = courseOutlineSchema.parse(parsedJson);
    return validatedOutline;
  } catch (error) {
    console.error("Course generation failed:", error.message);
    if (error.name === "ZodError") {
      throw new Error(`AI generated outline did not match expected structure: ${error.errors.map(e => e.message).join(", ")}`);
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
- Duration: ${setupParams.durationDays} days (${setupParams.dailyStudyTime}/day)
- Preference: ${setupParams.learningPreference}

CURRENT COURSE OUTLINE:
${JSON.stringify(currentOutline, null, 2)}

USER REQUESTED MODIFICATIONS:
"${modifications}"

INSTRUCTIONS:
1. Update the outline to carefully incorporate ALL requested modifications while maintaining Bloom's Taxonomy progression (Foundations -> Application -> Mastery).
2. Keep unaffected parts of the curriculum intact for continuity.
3. Return ONLY the updated valid JSON object strictly matching the schema.
4. No HTML, no markdown code fences, no introductory or concluding chatter.

EXACT JSON SCHEMA:
{
  "title": "string",
  "description": "string",
  "learningObjectives": ["string"],
  "estimatedDuration": "string",
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
        model: "gemini-2.5-flash",
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
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
      });
      const result = await model.generateContent(prompt);
      rawOutput = result.response.text();
    }

    const parsedJson = cleanAndParseJson(rawOutput);
    const validatedOutline = courseOutlineSchema.parse(parsedJson);
    return validatedOutline;
  } catch (error) {
    console.error("Course modification failed:", error.message);
    if (error.name === "ZodError") {
      throw new Error(`Modified outline did not match expected structure: ${error.errors.map(e => e.message).join(", ")}`);
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
  durationDays,
  dailyStudyTime,
  learningPreference,
}) => {
  return {
    title: `Mastering ${topic}: From Fundamentals to Production`,
    description: `A structured ${durationDays}-day learning path for ${topic} engineered using Bloom's Taxonomy progression. Tailored for ${currentLevel} learners with a focus on "${learningGoal}" utilizing a ${learningPreference.toLowerCase()} approach.`,
    learningObjectives: [
      `Recall and explain foundational mental models and architectural principles of ${topic}`,
      `Apply core mechanisms and best practices to solve real-world technical problems`,
      `Analyze performance tradeoffs and debug complex failure scenarios`,
      `Synthesize learned concepts into an end-to-end production capstone project`,
    ],
    estimatedDuration: `${durationDays} Days • ${dailyStudyTime}/day`,
    modules: [
      {
        title: `Module 1: Foundations & Mental Models (Remember & Understand)`,
        description: `Establish essential domain vocabulary, system boundaries, and underlying principles of ${topic}.`,
        estimatedMinutes: 90,
        lessons: [
          {
            title: `Introduction to ${topic} Ecosystem`,
            learningObjective: `Identify key components and understand the fundamental architecture of ${topic}`,
          },
          {
            title: `Core Terminology & Mental Models`,
            learningObjective: `Define critical terms, lifecycle stages, and standard patterns in ${topic}`,
          },
          {
            title: `Setting Up Your Development Environment`,
            learningObjective: `Configure tools, dependencies, and validation environments for ${topic}`,
          },
        ],
      },
      {
        title: `Module 2: Core Mechanics & Implementation (Apply & Analyze)`,
        description: `Hands-on problem solving and procedural execution for standard workflows in ${topic}.`,
        estimatedMinutes: 120,
        lessons: [
          {
            title: `Implementing Primary Workflows`,
            learningObjective: `Write, execute, and verify primary patterns and operations in ${topic}`,
          },
          {
            title: `Data Flow & State Management`,
            learningObjective: `Trace execution paths, isolate bottlenecks, and structure data efficiently`,
          },
          {
            title: `Common Gotchas & Error Prevention`,
            learningObjective: `Diagnose common bugs, boundary cases, and edge failure modes`,
          },
        ],
      },
      {
        title: `Module 3: Advanced Architecture & Tradeoffs (Evaluate)`,
        description: `Critically evaluate competing patterns, security constraints, and scale factors.`,
        estimatedMinutes: 150,
        lessons: [
          {
            title: `Scaling & Performance Optimization`,
            learningObjective: `Analyze system metrics and implement latency and memory optimizations`,
          },
          {
            title: `Security Best Practices & Hardening`,
            learningObjective: `Audit security risks, apply input sanitization, and manage access boundaries`,
          },
        ],
      },
      {
        title: `Module 4: Capstone Synthesis & Deployment (Create)`,
        description: `Synthesize all concepts to design and deliver a real-world system achieving: "${learningGoal}".`,
        estimatedMinutes: 180,
        lessons: [
          {
            title: `Capstone Project Architecture`,
            learningObjective: `Draft the comprehensive architecture for a complete ${topic} application`,
          },
          {
            title: `Integration, Testing & Deployment`,
            learningObjective: `Deploy, monitor, and deliver a production-ready system meeting the primary learning goal`,
          },
        ],
      },
    ],
  };
};

const modifyDemoOutline = ({ currentOutline, modifications, setupParams }) => {
  const updatedModules = [
    ...currentOutline.modules,
    {
      title: `Specialized Module: Tailored Modifications`,
      description: `Targeted module incorporated to address user request: "${modifications}"`,
      estimatedMinutes: 90,
      lessons: [
        {
          title: `Focused Deep Dive on ${modifications.slice(0, 40)}`,
          learningObjective: `Integrate user-customized focus area into ${setupParams.topic}`,
        },
      ],
    },
  ];

  return {
    ...currentOutline,
    title: `${currentOutline.title} (Updated)`,
    description: `${currentOutline.description} • Adjusted based on feedback: "${modifications}"`,
    modules: updatedModules,
  };
};
