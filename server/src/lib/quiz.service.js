import { resolveApiKey, callGemini } from "./gemini.service.js";
import { quizOutputSchema } from "../modules/quizzes/quiz.validator.js";

/**
 * Generate a 5-question conceptual quiz based on lesson content using Gemini.
 */
export const generateQuizWithGemini = async ({
  lessonTitle,
  lessonContent = {},
  currentLevel = "Beginner",
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

  // Instant demo mode generation for testing
  if (activeKey === "DEMO_MODE") {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("Demo mode is disabled in production. Please configure a valid Gemini API key.");
      error.status = 401;
      error.code = "INVALID_API_KEY";
      throw error;
    }
    return generateDemoQuiz({ lessonTitle, lessonContent, currentLevel });
  }

  // Build condensed lesson context string
  let lessonContext = "";
  if (typeof lessonContent === "string") {
    lessonContext = lessonContent.slice(0, 3000);
  } else if (lessonContent && typeof lessonContent === "object") {
    const contextParts = [];
    if (lessonContent.introduction) {
      contextParts.push(`INTRODUCTION:\n${lessonContent.introduction.slice(0, 600)}`);
    }
    if (lessonContent.explanation) {
      contextParts.push(`CORE EXPLANATION:\n${lessonContent.explanation.slice(0, 1500)}`);
    }
    if (lessonContent.keyConcepts && lessonContent.keyConcepts.length > 0) {
      contextParts.push(`KEY CONCEPTS:\n${lessonContent.keyConcepts.join("\n")}`);
    }
    if (lessonContent.commonMistakes && lessonContent.commonMistakes.length > 0) {
      contextParts.push(`COMMON MISTAKES & MISCONCEPTIONS:\n${lessonContent.commonMistakes.join("\n")}`);
    }
    lessonContext = contextParts.join("\n\n");
  }
  lessonContext = lessonContext || `Lesson on ${lessonTitle}`;

  const prompt = `You are PadhAI's master educational assessment specialist.
Your task is to generate exactly 5 multiple-choice quiz questions strictly based on the provided lesson content:

LESSON TITLE: "${lessonTitle}"
LEARNER LEVEL: ${currentLevel}

LESSON SOURCE MATERIAL:
${lessonContext}

STRICT PEDAGOGICAL QUIZ REQUIREMENTS:
1. Scope: Questions must be derived STRICTLY from the lesson concepts and context above. Do NOT ask outside the scope of this lesson.
2. Difficulty Distribution: Provide a balanced mix:
   - Question 1: "Easy" (Foundational recall, definition, core mental model)
   - Questions 2 & 3: "Medium" (Conceptual understanding, mechanism behavior, comparing approaches)
   - Questions 4 & 5: "Hard" (Practical scenario application, trade-off decision, diagnosing a common mistake)
3. Quality & Application: Test understanding, diagnostic analysis, and real-world application rather than trivial verbatim keyword memorization.
4. Distractors: Provide 4 plausible options for each question. One unambiguously correct answer (index 0, 1, 2, or 3).
5. Explanations: Provide a clear, educational explanation stating WHY the correct option is right and why the distractors are flawed.
6. Tagging: Tag each question with a specific "relatedConcept" (e.g., "Idempotency", "Leader Election", "State Invariants") so learners can identify weak areas.
7. Format: Output strictly valid JSON conforming to the schema below. No HTML tags, no markdown code fences, no extra text.

EXACT JSON SCHEMA TO SATISFY:
{
  "questions": [
    {
      "question": "string (clear question prompt)",
      "options": [
        "string (Option A)",
        "string (Option B)",
        "string (Option C)",
        "string (Option D)"
      ],
      "correctAnswer": 0,
      "explanation": "string (clear educational explanation)",
      "difficulty": "Easy",
      "relatedConcept": "string (concept name from the lesson)"
    }
  ]
}`;

  const result = await callGemini({
    prompt,
    temperature: 0.5,
    apiKey: activeKey,
  });

  const normalized = Array.isArray(result) ? { questions: result } : result;
  return quizOutputSchema.parse(normalized);
};

/**
 * High quality Demo Quiz Generator for zero-cost developer testing.
 */
const generateDemoQuiz = ({ lessonTitle, lessonContent, currentLevel }) => {
  return {
    isDemo: true,
    questions: [
      {
        question: `What is the primary architectural purpose of ${lessonTitle} as introduced in the lesson?`,
        options: [
          `To establish predictable coordination and prevent concurrent state corruption.`,
          `To compress network packets and reduce payload bandwidth by 90%.`,
          `To completely eliminate the need for databases and persistent storage.`,
          `To force all client requests to run in a single synchronous thread.`,
        ],
        correctAnswer: 0,
        explanation: `As discussed in the lesson's mental model, the primary role is establishing structured coordination, isolated transitions, and preventing conflicting state mutations.`,
        difficulty: "Easy",
        relatedConcept: "Mental Model & Core Architecture",
      },
      {
        question: `Which mathematical property ensures that repeating an identical operation multiple times yields the exact same state as executing it once?`,
        options: [
          `Commutativity ($A + B = B + A$)`,
          `Idempotency ($f(f(x)) = f(x)$)`,
          `Associativity ($(A \\times B) \\times C = A \\times (B \\times C)$)`,
          `Transitivity ($A > B \\land B > C \\implies A > C$)`,
        ],
        correctAnswer: 1,
        explanation: `Idempotency ensures that subsequent retries (e.g. after network timeouts) produce the exact same outcome without creating duplicate transactions or state corruption.`,
        difficulty: "Medium",
        relatedConcept: "Idempotency Guarantee",
      },
      {
        question: `In production systems like Stripe or Netflix, what is the standard mechanism used to prevent duplicate executions during network retries?`,
        options: [
          `Disabling retries entirely on the client side.`,
          `Unique idempotency tokens or deduplication keys tracked on the server.`,
          `Increasing the HTTP timeout window to 10 minutes.`,
          `Rebooting the service node whenever a request fails.`,
        ],
        correctAnswer: 1,
        explanation: `Idempotency tokens allow the server to recognize previously received request payloads and return the cached result instead of executing duplicate side-effects.`,
        difficulty: "Medium",
        relatedConcept: "Production Implementation Patterns",
      },
      {
        question: `Consider a scenario where multiple clients submit retry requests concurrently during a brief network partition. What common mistake leads to a "thunderous herd" bottleneck?`,
        options: [
          `Applying exponential backoff with randomized jitter before each retry attempt.`,
          `Retrying immediately and simultaneously on a fixed, unjittered interval across all clients.`,
          `Logging error messages to standard monitoring collectors.`,
          `Validating payload schema prior to database execution.`,
        ],
        correctAnswer: 1,
        explanation: `Retrying simultaneously on fixed intervals synchronizes failed requests into repeated massive bursts, causing severe downstream congestion known as the thunderous herd problem.`,
        difficulty: "Hard",
        relatedConcept: "Retry Strategies & Backpressure",
      },
      {
        question: `When designing for ${currentLevel.toLowerCase()} scale, which design invariant should be enforced before and after every state transition?`,
        options: [
          `The state invariant must remain mathematically sound across all operational boundaries.`,
          `All requests must be buffered in local server memory without durability.`,
          `Every API call must bypass validation checks to minimize latency.`,
          `Global shared variables must be mutated without locks or synchronization.`,
        ],
        correctAnswer: 0,
        explanation: `Invariant enforcement guarantees that system integrity and constraints (such as non-negative balances or valid pointers) are preserved through every lifecycle transition.`,
        difficulty: "Hard",
        relatedConcept: "Invariant Enforcement",
      },
    ],
  };
};
