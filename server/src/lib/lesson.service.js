import { resolveApiKey, callGemini } from "./gemini.service.js";
import { lessonContentSchema } from "../modules/lessons/lesson.validator.js";

/**
 * Determine Bloom's Taxonomy cognitive stage based on module position.
 */
export const getBloomTaxonomyStage = (moduleIndex, totalModules = 4) => {
  const ratio = (moduleIndex + 1) / Math.max(1, totalModules);
  if (ratio <= 0.3) return "Remember & Understand (Foundational Recall & Comprehension)";
  if (ratio <= 0.6) return "Apply & Analyze (Procedural Mechanics & Problem-Solving)";
  if (ratio <= 0.85) return "Evaluate (Tradeoff Analysis, Optimization & Critique)";
  return "Evaluate & Create (Synthesis, System Design & Capstone Mastery)";
};

/**
 * Generate rich educational lesson content using Gemini strictly in Markdown format.
 */
export const generateLessonContentWithGemini = async ({
  courseTitle,
  courseDescription,
  currentLevel,
  learningPreference,
  moduleTitle,
  moduleDescription,
  moduleIndex,
  totalModules = 4,
  lessonTitle,
  learningObjective,
  lessonIndex,
  previousLessonsContext = [],
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

  const bloomStage = getBloomTaxonomyStage(moduleIndex, totalModules);

  // Instant demo mode generation for local testing without external API cost
  if (activeKey === "DEMO_MODE") {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("Demo mode is disabled in production. Please configure a valid Gemini API key.");
      error.status = 401;
      error.code = "INVALID_API_KEY";
      throw error;
    }
    return generateDemoLessonContent({
      courseTitle,
      moduleTitle,
      lessonTitle,
      learningObjective,
      currentLevel,
      bloomStage,
      learningPreference,
    });
  }

  // Construct previous lessons context string for scaffolding & continuity
  let previousContextStr = "None (This is the inaugural lesson).";
  if (previousLessonsContext && previousLessonsContext.length > 0) {
    previousContextStr = previousLessonsContext
      .map(
        (prev, i) =>
          `- Lesson: "${prev.title}" | Objective: "${prev.learningObjective}"`
      )
      .join("\n");
  }

  const prompt = `You are PadhAI's master educator and personal tutor.
Your task is to generate a comprehensive, highly engaging, and pedagogically rigorous lesson on:

COURSE TITLE: "${courseTitle}"
MODULE: "${moduleTitle}" (${moduleDescription || "Core module"})
LESSON: "${lessonTitle}"
PRIMARY LEARNING OBJECTIVE: "${learningObjective}"
TARGET LEARNER LEVEL: ${currentLevel}
LEARNING STYLE: ${learningPreference}
BLOOM'S TAXONOMY STAGE: ${bloomStage}

PREVIOUS LESSONS CONTEXT (FOR PEDAGOGICAL CONTINUITY):
${previousContextStr}

STRICT PEDAGOGICAL INSTRUCTIONS:
1. Explain concepts calibrated for a ${currentLevel} learner.
   - If Beginner: Use crystal-clear analogies, intuitive mental models, avoid excessive jargon without defining it first.
   - If Intermediate: Focus on underlying mechanics, concrete code/formulas, trade-offs, and typical production hurdles.
   - If Advanced: Focus on performance guarantees, edge cases, distributed concurrency, scalability, and deep architectural trade-offs.
2. CONTINUITY: Connect this lesson to ideas established in previous lessons where applicable. Do NOT re-explain or duplicate basics from prior lessons.
3. FORMATTING: Use rich, clean MARKDOWN for all content. 
   - NEVER output raw HTML tags (no <div>, <p>, <span>, <br>).
   - Use Markdown bold (**text**), italics (*text*), blockquotes (> note), lists (- item), code blocks with language identifiers (\`\`\`python, \`\`\`javascript, etc.), tables, and inline math ($...$) if relevant.
4. EXAMPLES: Provide realistic, practical code or analytical examples illustrating the concepts.
5. MISCONCEPTIONS: Point out 2-3 common traps or misconceptions students often fall into.
6. OUTPUT: Return strictly valid JSON conforming to the schema below. No markdown fences around the JSON, no prologue or epilogue text.

EXACT JSON SCHEMA TO SATISFY:
{
  "title": "${lessonTitle}",
  "learningObjective": "${learningObjective}",
  "introduction": "string (engaging Markdown introduction introducing the concept, real-world context, and intuitive analogy)",
  "explanation": "string (deep, structured Markdown explanation with subheadings (###), step-by-step concept breakdown, and clear explanations)",
  "keyConcepts": [
    "string (concise key concept title and 1-2 sentence definition or rule)"
  ],
  "examples": [
    "string (concrete practical example or code snippet in Markdown with thorough explanation)"
  ],
  "realWorldApplication": "string (Markdown description of how top tech companies or production systems implement this concept in industry)",
  "commonMistakes": [
    "string (common mistake, why it happens, and how to avoid it)"
  ],
  "summary": "string (cohesive Markdown recap synthesizing the lesson)",
  "importantTakeaways": [
    "string (actionable core takeaway bullet)"
  ],
  "estimatedReadingTime": "string (e.g., '7 mins' or '10 mins')"
}`;

  return await callGemini({
    prompt,
    responseSchema: lessonContentSchema,
    temperature: 0.7,
    apiKey: activeKey,
  });
};

/**
 * High quality Demo Lesson Content Generator for zero-cost developer testing.
 */
const generateDemoLessonContent = ({
  courseTitle,
  moduleTitle,
  lessonTitle,
  learningObjective,
  currentLevel,
  bloomStage,
  learningPreference,
}) => {
  return {
    isDemo: true,
    title: lessonTitle,
    learningObjective: learningObjective,
    introduction: `Welcome to **${lessonTitle}**, part of the **${moduleTitle}** module in *${courseTitle}*.\n\n` +
      `### The Intuitive Mental Model 💡\n\n` +
      `Imagine you are running a busy restaurant kitchen. If all chefs attempt to access a single refrigerator at the exact same moment without coordination, confusion and dropped plates are inevitable. ` +
      `In software and computing, **${lessonTitle}** serves as the recipe and coordination protocol that guarantees operations happen smoothly, predictably, and with zero data loss.\n\n` +
      `In this lesson, you will master: *${learningObjective}*.`,
    explanation: `### Core Mechanism & Architectural Breakdown\n\n` +
      `When building modern systems, understanding the fundamental lifecycle of **${lessonTitle}** is essential. Below is the primary operational loop:\n\n` +
      `1. **Request Intake & Validation**: The system parses incoming commands and verifies integrity.\n` +
      `2. **State Isolation**: Rather than performing in-place mutations, an immutable transition state is prepared.\n` +
      `3. **Atomic Execution**: Operations execute under strict isolation guarantees ($ACID$ or eventual consistency).\n` +
      `4. **Confirmation & Telemetry**: Emits acknowledgement metrics to monitoring agents.\n\n` +
      `### Comparison Matrix\n\n` +
      `| Strategy / Approach | Latency Profile | Complexity | Fault Tolerance |\n` +
      `| :--- | :--- | :--- | :--- |\n` +
      `| **Naïve Synchronous** | High ($\mathcal{O}(N)$) | Low | Fragile (Single point of failure) |\n` +
      `| **Asynchronous Event-Driven** | Sub-millisecond ($\mathcal{O}(1)$ queue) | Moderate | Resilient via replay buffers |\n` +
      `| **Consensus Clustered** | Bounded Network RTT | Advanced | High ($N/2 + 1$ quorum) |\n\n` +
      `> **Key Rule of Thumb**: For ${currentLevel.toLowerCase()} architectures, favor predictable isolation over micro-optimizations.`,
    keyConcepts: [
      `**Invariant Enforcement**: Ensuring that system state invariants remain mathematically valid before and after every state transition.`,
      `**Idempotency Guarantee**: A design pattern where repeating an identical operation multiple times yields the exact same state as running it once ($f(f(x)) = f(x)$).`,
      `**Graceful Degradation**: The ability of a system to maintain essential functions even when auxiliary subcomponents fail.`,
    ],
    examples: [
      `\`\`\`javascript\n// Production implementation pattern for ${lessonTitle}\nasync function executeWithRetry(operation, maxRetries = 3) {\n  let attempt = 0;\n  while (attempt < maxRetries) {\n    try {\n      console.log(\`[PadhAI] Executing step: \${operation.name} (Attempt \${attempt + 1})\`);\n      const result = await operation.execute();\n      return { status: "SUCCESS", data: result };\n    } catch (err) {\n      attempt++;\n      const backoffMs = Math.pow(2, attempt) * 100;\n      console.warn(\`⚠️ Step failed: \${err.message}. Retrying in \${backoffMs}ms...\`);\n      await new Promise(r => setTimeout(r, backoffMs));\n    }\n  }\n  throw new Error(\`Operation exceeded \${maxRetries} retry attempts.\`);\n}\n\`\`\`\n\n` +
      `In this code example, notice how exponential backoff prevents thunderous herd problems during transient network partitions.`,
    ],
    realWorldApplication: `High-throughput platforms like **Netflix**, **Stripe**, and **Uber** rely heavily on this pattern to process millions of transactions per second. ` +
      `For instance, Stripe uses strict idempotency tokens on every payment request to ensure a user is never double-charged even if network timeouts cause duplicate retries.`,
    commonMistakes: [
      `**Assuming Synchronous Reliability**: Trusting that network calls will always succeed within expected SLA windows without configuring timeouts.`,
      `**State Mutation Leaks**: Modifying shared global state directly rather than using pure functions or immutable updates.`,
      `**Ignoring Backpressure**: Overwhelming downstream consumer services by sending bursts without rate limiting or queuing.`,
    ],
    summary: `In this lesson on **${lessonTitle}**, we established the foundational mental model, dissected the core operational loop, and reviewed production code patterns. ` +
      `By applying these principles, you prevent cascading failures and ensure your systems remain resilient under load.`,
    importantTakeaways: [
      `Always design operations to be idempotent whenever distributed networks or retries are involved.`,
      `Decouple critical execution paths from non-blocking auxiliary tasks.`,
      `Benchmark real workloads rather than relying on synthetic micro-benchmarks.`,
    ],
    estimatedReadingTime: `8 mins`,
  };
};
