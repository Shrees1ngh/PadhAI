import 'dotenv/config';
import { generateCheatsheetWithGemini, classifyTopicWithGemini } from './src/lib/cheatsheet.service.js';
import { generatedCheatsheetSchema } from './src/modules/cheatsheets/cheatsheet.validator.js';

const TEST_CASES = [
  {
    topic: 'Marginal Utility',
    expectedDomain: ['economics', 'business_finance'],
    requiredBlockTypes: ['chart', 'formula', 'table', 'real_life'],
    prohibitedBlockTypes: ['code', 'syntax'],
  },
  {
    topic: 'Binary Search',
    expectedDomain: ['computer_science', 'programming'],
    requiredBlockTypes: ['code', 'table', 'diagram'],
    prohibitedBlockTypes: [],
  },
  {
    topic: 'French Revolution',
    expectedDomain: ['history'],
    requiredBlockTypes: ['timeline'],
    prohibitedBlockTypes: ['code', 'syntax', 'formula'],
  },
  {
    topic: 'Photosynthesis',
    expectedDomain: ['biology'],
    requiredBlockTypes: ['diagram'],
    prohibitedBlockTypes: ['code', 'syntax'],
  },
  {
    topic: 'Capital Market',
    expectedDomain: ['economics', 'business_finance', 'accounting'],
    requiredBlockTypes: ['table'],
    prohibitedBlockTypes: ['code', 'syntax'],
    notDomain: ['computer_science', 'programming'],
  },
  {
    topic: 'Inflation',
    expectedDomain: ['economics', 'business_finance'],
    requiredBlockTypes: ['chart', 'formula'],
    prohibitedBlockTypes: ['code', 'syntax'],
  },
  {
    topic: "Ohm's Law",
    expectedDomain: ['physics', 'chemistry', 'mathematics'],
    requiredBlockTypes: ['formula', 'chart'],
    prohibitedBlockTypes: ['code', 'syntax'],
  },
];

async function runMatrix(apiKey = "DEMO_MODE") {
  console.log('================================================================');
  console.log(`PADHAI CHEATSHEET GENERATOR — TEST MATRIX (${apiKey === "DEMO_MODE" ? "DEMO MODE VALIDATION" : "LIVE GEMINI API"})`);
  console.log('================================================================\n');

  const results = [];

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    console.log(`[Test ${i + 1}/${TEST_CASES.length}] Testing Topic: "${tc.topic}"...`);
    const startTime = Date.now();

    try {
      const classification = await classifyTopicWithGemini({
        topic: tc.topic,
        level: 'Beginner',
        apiKey,
      });
      console.log(`  -> Classification: domain="${classification.domain}", subdomain="${classification.subdomain}"`);

      const cheatsheet = await generateCheatsheetWithGemini({
        topic: tc.topic,
        currentLevel: 'Beginner',
        language: 'english',
        apiKey,
      });

      // Strict Schema Validation
      const validated = generatedCheatsheetSchema.parse(cheatsheet);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      const blockTypes = validated.blocks.map((b) => b.type);
      console.log(`  -> Generated ${validated.blocks.length} blocks in ${elapsed}s`);
      console.log(`  -> Block types: [${blockTypes.join(', ')}]`);

      // Assertions
      const domainMatch = Array.isArray(tc.expectedDomain)
        ? tc.expectedDomain.includes(validated.domain)
        : validated.domain === tc.expectedDomain;

      const notDomainPass = !tc.notDomain || !tc.notDomain.includes(validated.domain);

      const hasRequired = tc.requiredBlockTypes.every((req) => blockTypes.includes(req));
      const hasNoProhibited = tc.prohibitedBlockTypes.every((prohib) => !blockTypes.includes(prohib));

      const passed = domainMatch && notDomainPass && hasRequired && hasNoProhibited;

      const summary = {
        topic: tc.topic,
        domain: validated.domain,
        blockCount: validated.blocks.length,
        blockTypes: [...new Set(blockTypes)],
        passed,
        checks: {
          domainMatch,
          notDomainPass,
          hasRequired,
          hasNoProhibited,
        },
        elapsed: `${elapsed}s`,
      };

      results.push(summary);

      if (passed) {
        console.log(`  ✅ PASSED: All domain & block assertions satisfied.\n`);
      } else {
        console.log(`  ❌ FAILED checks:`, summary.checks, '\n');
      }
    } catch (err) {
      console.error(`  ❌ ERROR for "${tc.topic}":`, err.message, '\n');
      results.push({
        topic: tc.topic,
        passed: false,
        error: err.message,
      });
    }
  }

  console.log('================================================================');
  console.log('TEST MATRIX SUMMARY TABLE:');
  console.log('================================================================');
  console.table(
    results.map((r) => ({
      Topic: r.topic,
      Domain: r.domain || 'N/A',
      Blocks: r.blockCount || 0,
      'Types Summary': r.blockTypes ? r.blockTypes.join(', ') : 'ERROR',
      Passed: r.passed ? '✅ YES' : '❌ NO',
      Time: r.elapsed || 'N/A',
    }))
  );
}

runMatrix("DEMO_MODE");
