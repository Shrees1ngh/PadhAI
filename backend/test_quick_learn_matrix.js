import assert from "assert";
import { generateQuickLearnContentWithGemini } from "./src/lib/topic.service.js";
import { generatedTopicContentSchema } from "./src/modules/topics/topic.validator.js";

const TEST_MATRIX = [
  {
    topic: "Marginal Utility",
    expectedDomain: "economics",
    expectedVis: "none",
    requiredBlockTypes: ["definition", "formula", "chart", "table", "real_life", "mini_quiz"],
    forbiddenBlockTypes: ["code", "syntax"],
  },
  {
    topic: "Binary Search Tree",
    expectedDomain: "computer_science",
    expectedVis: "bst",
    requiredBlockTypes: ["definition", "code", "diagram", "table", "step_by_step", "mini_quiz"],
    forbiddenBlockTypes: [],
  },
  {
    topic: "French Revolution",
    expectedDomain: "history",
    expectedVis: "none",
    requiredBlockTypes: ["definition", "timeline", "table", "real_life", "mini_quiz"],
    forbiddenBlockTypes: ["code", "syntax"],
  },
  {
    topic: "Photosynthesis",
    expectedDomain: "biology",
    expectedVis: "none",
    requiredBlockTypes: ["definition", "formula", "diagram", "table", "step_by_step", "mini_quiz"],
    forbiddenBlockTypes: ["code", "syntax"],
  },
  {
    topic: "Capital Market",
    expectedDomain: "business_finance",
    expectedVis: "none",
    requiredBlockTypes: ["definition", "table", "real_life", "step_by_step", "mini_quiz"],
    forbiddenBlockTypes: ["code", "syntax"],
  },
];

async function runQuickLearnMatrix() {
  console.log("================================================================");
  console.log("PADHAI QUICK LEARN ENGINE — DOMAIN ADAPTIVE TEST MATRIX");
  console.log("================================================================\n");

  const results = [];

  for (let i = 0; i < TEST_MATRIX.length; i++) {
    const testCase = TEST_MATRIX[i];
    console.log(`[Test ${i + 1}/${TEST_MATRIX.length}] Testing Topic: "${testCase.topic}"...`);
    const startTime = Date.now();

    const output = await generateQuickLearnContentWithGemini({
      topic: testCase.topic,
      level: "Beginner",
      language: "english",
      apiKey: "DEMO_MODE", // Validates pipeline, schema & domain adaptability
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    // 1. Zod schema validation
    const parsed = generatedTopicContentSchema.parse(output);
    assert(parsed.blocks.length >= 5, "Must contain >= 5 blocks");

    // 2. Domain & Visualizer assertions
    assert.strictEqual(output.domain, testCase.expectedDomain, `Domain mismatch: got ${output.domain}, expected ${testCase.expectedDomain}`);
    assert.strictEqual(output.visualizationType, testCase.expectedVis, `VisualizationType mismatch: got ${output.visualizationType}, expected ${testCase.expectedVis}`);

    // 3. Block type inspection
    const blockTypes = output.blocks.map((b) => b.type);
    console.log(`  -> Classification: domain="${output.domain}", subdomain="${output.subdomain}", visType="${output.visualizationType}"`);
    console.log(`  -> Generated ${output.blocks.length} blocks in ${elapsed}s`);
    console.log(`  -> Block types: [${blockTypes.join(", ")}]`);

    for (const reqType of testCase.requiredBlockTypes) {
      assert(
        blockTypes.includes(reqType),
        `Missing required block type "${reqType}" for topic "${testCase.topic}"`
      );
    }

    for (const forbType of testCase.forbiddenBlockTypes) {
      assert(
        !blockTypes.includes(forbType),
        `Forbidden block type "${forbType}" was found for non-CS topic "${testCase.topic}"`
      );
    }

    // 4. Mini quiz validation: exactly 4 options, integer correctOptionIndex (0-3)
    const quizBlock = output.blocks.find((b) => b.type === "mini_quiz");
    assert(quizBlock, "Mini quiz block must exist");
    assert(Array.isArray(quizBlock.questions) && quizBlock.questions.length >= 1, "Must have questions");
    quizBlock.questions.forEach((q, idx) => {
      assert.strictEqual(q.options.length, 4, `Question ${idx} must have exactly 4 options`);
      assert(typeof q.correctOptionIndex === "number" && q.correctOptionIndex >= 0 && q.correctOptionIndex <= 3, `Question ${idx} correctOptionIndex must be 0-3`);
    });

    console.log(`  ✅ PASSED: All domain, block & mini quiz assertions satisfied.\n`);

    results.push({
      Topic: testCase.topic,
      Domain: output.domain,
      VisType: output.visualizationType,
      Blocks: output.blocks.length,
      "Types Summary": blockTypes.join(", "),
      Passed: "✅ YES",
      Time: `${elapsed}s`,
    });
  }

  console.log("================================================================");
  console.log("QUICK LEARN TEST MATRIX SUMMARY TABLE:");
  console.log("================================================================");
  console.table(results);
}

runQuickLearnMatrix().catch((err) => {
  console.error("Test Matrix Failed:", err);
  process.exit(1);
});
