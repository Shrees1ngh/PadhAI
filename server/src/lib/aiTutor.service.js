import { resolveApiKey, callGemini } from "./gemini.service.js";
import { tutorChatOutputSchema } from "../modules/ai-tutor/aiTutor.validator.js";

/**
 * Generate a contextual, pedagogical AI Tutor response grounded in the current lesson.
 */
export const chatWithAITutor = async ({
  message,
  courseTitle = "General Course",
  moduleTitle = "",
  lessonTitle = "",
  learningObjective = "",
  lessonContent = {},
  learnerLevel = "Beginner",
  conversationHistory = [],
  apiKey,
}) => {
  const activeKey = resolveApiKey(apiKey);

  if (!activeKey) {
    const error = new Error(
      "Gemini API key is required. Please set GEMINI_API_KEY in server/.env or configure it in the application."
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
    return generateDemoTutorResponse({
      message,
      lessonTitle,
      learnerLevel,
      conversationHistory,
    });
  }

  // Construct structured lesson context
  const contextSections = [];
  if (courseTitle) contextSections.push(`COURSE/TOPIC: ${courseTitle}`);
  if (moduleTitle) contextSections.push(`MODULE/SECTION: ${moduleTitle}`);
  if (lessonTitle) contextSections.push(`ACTIVE LESSON: ${lessonTitle}`);
  if (learningObjective) contextSections.push(`LEARNING OBJECTIVE: ${learningObjective}`);
  if (learnerLevel) contextSections.push(`LEARNER PROFICIENCY LEVEL: ${learnerLevel}`);

  if (typeof lessonContent === "string" && lessonContent.trim()) {
    contextSections.push(`LESSON CONTENT:\n${lessonContent.slice(0, 3000)}`);
  } else if (lessonContent && typeof lessonContent === "object") {
    if (lessonContent.simpleExplanation) {
      contextSections.push(`TOPIC OVERVIEW & EXPLANATION:\n${lessonContent.simpleExplanation.slice(0, 1500)}`);
    }
    if (lessonContent.whyItMatters) {
      contextSections.push(`WHY IT MATTERS:\n${lessonContent.whyItMatters.slice(0, 1000)}`);
    }
    if (lessonContent.realLifeAnalogy) {
      contextSections.push(`REAL-LIFE ANALOGY:\n${lessonContent.realLifeAnalogy.slice(0, 1000)}`);
    }
    if (lessonContent.introduction) {
      contextSections.push(`LESSON INTRODUCTION:\n${lessonContent.introduction.slice(0, 1000)}`);
    }
    if (lessonContent.explanation) {
      contextSections.push(`LESSON CORE EXPLANATION:\n${lessonContent.explanation.slice(0, 2000)}`);
    }
    if (lessonContent.keyConcepts?.length) {
      contextSections.push(`LESSON KEY CONCEPTS:\n- ${lessonContent.keyConcepts.join("\n- ")}`);
    }
    if (lessonContent.coreConcepts?.length) {
      const formattedConcepts = lessonContent.coreConcepts.map(c => typeof c === 'string' ? c : `${c.title}: ${c.description || ''}`);
      contextSections.push(`CORE CONCEPTS:\n- ${formattedConcepts.join("\n- ")}`);
    }
    if (lessonContent.commonMistakes?.length) {
      contextSections.push(`COMMON MISTAKES & MISCONCEPTIONS:\n- ${lessonContent.commonMistakes.join("\n- ")}`);
    }
    if (lessonContent.summary) {
      contextSections.push(`LESSON SUMMARY:\n${lessonContent.summary.slice(0, 1000)}`);
    }
  }

  const lessonContextString = contextSections.join("\n\n");

  // Format recent conversation history (last 6 exchanges max to conserve tokens)
  const historyFormatted = conversationHistory
    .slice(-6)
    .map((msg) => `${msg.role === "user" ? "Learner" : "PadhAI Tutor"}: ${msg.content}`)
    .join("\n");

  const prompt = `You are PadhAI Tutor — an expert, encouraging, Socratic personal learning mentor.
Your primary role is to help the learner understand and master the specific concepts in their current lesson.

=== CURRENT LESSON CONTEXT ===
${lessonContextString}

=== RECENT CONVERSATION HISTORY ===
${historyFormatted || "(No prior conversation in this lesson session)"}

=== LEARNER'S QUESTION / PROMPT ===
"${message}"

=== PEDAGOGICAL INSTRUCTIONS ===
1. GROUNDEDNESS: Your explanation must be anchored in the active lesson's material ("${lessonTitle || courseTitle}").
2. SCOPE CHECK: If the learner asks about a topic completely unrelated to this lesson or course, answer briefly and politely inform them: "Note: This is outside the scope of our current lesson on ${lessonTitle || 'this topic'}, but here is a quick overview...". Set "isOutsideLessonScope": true.
3. ADAPTATION: Tailor tone, depth, and vocabulary to the learner's level: ${learnerLevel}.
   - Beginner: Use everyday metaphors, clear analogies, step-by-step intuition, avoid jargon without explaining it.
   - Intermediate: Explain architectural trade-offs, mechanisms, and concrete code patterns.
   - Advanced: Discuss system invariants, edge cases, distributed guarantees, and formal mental models.
4. FORMATTING: Use Markdown in the "answer" field for readable formatting (bolding key terms, numbered steps, code blocks, bullet points).
5. INTERACTIVITY: Suggest 2-3 brief, relevant follow-up questions or next steps the learner can ask next to deepen their understanding.
6. CONCEPTS: List 1-3 key concept tags directly related to this question.
7. OUTPUT FORMAT: Return ONLY a valid JSON object matching this schema:

{
  "answer": "string (Markdown formatted explanation with analogies/examples as helpful)",
  "relatedConcepts": ["Concept 1", "Concept 2"],
  "suggestedFollowUps": [
    "Suggested question 1",
    "Suggested question 2"
  ],
  "isOutsideLessonScope": false
}`;

  return await callGemini({
    prompt,
    responseSchema: tutorChatOutputSchema,
    temperature: 0.6,
    apiKey: activeKey,
  });
};

/**
 * High-quality Demo Tutor response for zero-cost offline development.
 */
const generateDemoTutorResponse = ({ message, lessonTitle = "Distributed Systems", learnerLevel = "Beginner" }) => {
  const queryLower = message.toLowerCase();

  if (queryLower.includes("simpler") || queryLower.includes("simple") || queryLower.includes("easy")) {
    return {
      isDemo: true,
      answer: `### 💡 Simplifying **${lessonTitle}** (${learnerLevel} Level)\n\nImagine ordering a pizza online. If your WiFi cuts out while clicking "Pay", you might hit the button 3 times.\n\nWithout **idempotency**, you get charged 3 times and receive 3 pizzas! 🍕🍕🍕\n\nWith **idempotency**, the server recognizes the identical request receipt and only charges you once for one single pizza. That's the entire core intuition: **doing an action multiple times produces the exact same result as doing it once.**`,
      relatedConcepts: ["Idempotency Guarantee", "Safe Retries", "Mental Model"],
      suggestedFollowUps: [
        "How do payment gateways like Stripe implement this?",
        "What happens if two requests arrive at the exact same millisecond?",
        "Quiz me on idempotency"
      ],
      isOutsideLessonScope: false,
    };
  }

  if (queryLower.includes("example") || queryLower.includes("code")) {
    return {
      isDemo: true,
      answer: `### 🔍 Practical Example in ${lessonTitle}\n\nHere is how you implement an idempotent HTTP endpoint using a deduplication key in Node.js / Express:\n\n\`\`\`javascript\napp.post('/api/orders', async (req, res) => {\n  const idempotencyKey = req.headers['idempotency-key'];\n  \n  // 1. Check if this key was already processed\n  const cachedResult = await redis.get(\`idemp:\${idempotencyKey}\`);\n  if (cachedResult) {\n    return res.status(200).json(JSON.parse(cachedResult));\n  }\n  \n  // 2. Execute business logic once\n  const order = await createOrder(req.body);\n  \n  // 3. Cache response with 24h TTL\n  await redis.set(\`idemp:\${idempotencyKey}\`, JSON.stringify(order), 'EX', 86400);\n  \n  return res.status(201).json(order);\n});\n\`\`\`\n\n**Key Takeaway:** The deduplication token prevents repeated side-effects while safely returning identical output on retries.`,
      relatedConcepts: ["Deduplication Keys", "Redis Caching", "API Architecture"],
      suggestedFollowUps: [
        "What TTL should be used for idempotency keys?",
        "Can a GET request be non-idempotent?",
        "Explain how consensus algorithms handle this"
      ],
      isOutsideLessonScope: false,
    };
  }

  if (queryLower.includes("analogy")) {
    return {
      isDemo: true,
      answer: `### 🧩 Mental Model & Real-World Analogy\n\nThink of the **Elevator Call Button**:\n\n- Pressing the **"Call Elevator"** button once turns the light on and registers your floor request.\n- Pressing it 10 more times aggressively **does not make 10 elevators arrive** and does not change the floor destination.\n- The state is unchanged whether pressed 1 time or 100 times: \`f(f(x)) = f(x)\`.\n\nIn distributed architecture, our APIs must behave like that elevator button!`,
      relatedConcepts: ["State Invariants", "Mathematical Property", "Analogy"],
      suggestedFollowUps: [
        "Why is HTTP POST not inherently idempotent?",
        "Give another analogy for leader election",
        "Explain simpler"
      ],
      isOutsideLessonScope: false,
    };
  }

  if (queryLower.includes("quiz")) {
    return {
      isDemo: true,
      answer: `### 🎯 Quick Contextual Quiz Question\n\n**Question:** Suppose an API endpoint creates a user in the database with auto-incrementing ID on every HTTP POST call without a unique email constraint.\n\nIs this endpoint **idempotent**? Why or why not?\n\n*Think about what happens if the network times out and the client retries the exact same request.*`,
      relatedConcepts: ["Self-Assessment", "Idempotency Diagnostic"],
      suggestedFollowUps: [
        "No, because it will create duplicate users with different IDs.",
        "Yes, because the user payload has identical values.",
        "Give me the answer and explanation"
      ],
      isOutsideLessonScope: false,
    };
  }

  return {
    isDemo: true,
    answer: `### 🎓 PadhAI Tutor on **${lessonTitle}**\n\nGreat question regarding **${lessonTitle}**! \n\nIn this lesson, the primary mental model centers on ensuring reliable, consistent system state even across network failures and concurrent operations.\n\nKey takeaways to keep in mind:\n- **Core Invariant**: System state transitions must remain mathematically sound across all operational boundaries.\n- **Failure Modes**: Network retries are inevitable, so servers must support deterministic recovery mechanisms without creating duplicate side-effects.\n\nHow would you like to explore this further? We can break down an example, simplify the math, or explore real-world production cases.`,
    relatedConcepts: ["Core Mental Model", "Reliability Patterns", "State Management"],
    suggestedFollowUps: [
      "Explain simpler",
      "Give me a real-world code example",
      "Give an analogy",
      "Quiz me on this topic"
    ],
    isOutsideLessonScope: false,
  };
};
