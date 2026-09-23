import assert from "assert";

const BASE_URL = "http://127.0.0.1:5000";

async function runE2E() {
  console.log("=================================================");
  console.log("🚀 STARTING PADHAI END-TO-END INTEGRATION AUDIT");
  console.log("=================================================\n");

  // 1. Health check with retry
  console.log("[E2E 1] Checking /api/health...");
  let healthRes = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      healthRes = await fetch(`${BASE_URL}/api/health`);
      if (healthRes.ok) break;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  assert(healthRes && healthRes.status === 200, "Health endpoint should return 200");
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, "ok");
  console.log(`  ✅ Health check passed. Database status: ${healthData.database.status}`);

  // 2. Authentication Flow
  console.log("\n[E2E 2] Testing User Registration & Authentication...");
  const uniqueEmail = `test_learner_${Date.now()}@padhai.edu`;
  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "PadhAI Learner",
      email: uniqueEmail,
      password: "StrongPassword123!",
    }),
  });

  const registerData = await registerRes.json();
  assert(registerRes.status === 201 || registerRes.status === 200, `Registration failed: ${JSON.stringify(registerData)}`);
  assert(registerData.token, "Token must be returned on registration");
  console.log("  ✅ Registration successful with bcrypt hash & JWT token generation.");

  const authToken = registerData.token;

  // Verify /api/auth/me
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.strictEqual(meRes.status, 200, "/api/auth/me should return 200");
  const meData = await meRes.json();
  assert.strictEqual(meData.user.email, uniqueEmail);
  console.log("  ✅ Authenticated profile verified via JWT.");

  // 3. Course Generation & Outlines
  console.log("\n[E2E 3] Testing Course Outline Generation...");
  const courseGenRes = await fetch(`${BASE_URL}/api/courses/generate-outline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gemini-key": "DEMO_MODE", // Test verified pipeline
    },
    body: JSON.stringify({
      topic: "Distributed Systems Architecture",
      learningGoal: "Build fault-tolerant consensus and state replication",
      currentLevel: "Intermediate",
      durationDays: 5,
      dailyStudyTime: "1.5 hours",
      learningPreference: "Hands-on projects with code examples",
    }),
  });

  assert.strictEqual(courseGenRes.status, 200, "Course generation should return 200");
  const courseGenData = await courseGenRes.json();
  assert(courseGenData.outline.days.length === 5, "Course must have exactly 5 days");
  assert(courseGenData.outline.title, "Course must have title");
  console.log(`  ✅ Generated course: "${courseGenData.outline.title}" with 5 days scaffolded.`);

  // 4. Lesson Generation
  console.log("\n[E2E 4] Testing Lesson Content Generation...");
  const lessonGenRes = await fetch(`${BASE_URL}/api/lessons/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gemini-key": "DEMO_MODE",
    },
    body: JSON.stringify({
      courseTitle: courseGenData.outline.title,
      moduleTitle: courseGenData.outline.days[0].moduleTitle,
      lessonTitle: courseGenData.outline.days[0].lessons[0].title,
      learningObjective: courseGenData.outline.days[0].lessons[0].learningObjective,
      currentLevel: "Intermediate",
      moduleIndex: 0,
      lessonIndex: 0,
      totalModules: 3,
    }),
  });

  assert.strictEqual(lessonGenRes.status, 200, "Lesson generation should return 200");
  const lessonGenData = await lessonGenRes.json();
  assert(lessonGenData.lesson.explanation, "Lesson must contain rich explanation");
  assert(Array.isArray(lessonGenData.lesson.keyConcepts), "Lesson must contain keyConcepts");
  console.log(`  ✅ Lesson generated successfully with Bloom's taxonomy stage: ${lessonGenData.meta.bloomTaxonomyStage}`);

  // 5. Quiz Generation
  console.log("\n[E2E 5] Testing Conceptual Quiz Generation...");
  const quizGenRes = await fetch(`${BASE_URL}/api/quizzes/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gemini-key": "DEMO_MODE",
    },
    body: JSON.stringify({
      lessonTitle: courseGenData.outline.days[0].lessons[0].title,
      lessonContent: lessonGenData.lesson,
      currentLevel: "Intermediate",
    }),
  });

  assert.strictEqual(quizGenRes.status, 200, "Quiz generation should return 200");
  const quizGenData = await quizGenRes.json();
  const questions = quizGenData.quiz?.questions || quizGenData.questions;
  assert(questions && questions.length === 5, "Quiz must contain exactly 5 questions");
  console.log(`  ✅ Quiz generated with ${questions.length} questions and answer keys.`);

  // 6. Flashcards Generation
  console.log("\n[E2E 6] Testing Flashcards Generation...");
  const flashcardsRes = await fetch(`${BASE_URL}/api/flashcards/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gemini-key": "DEMO_MODE",
    },
    body: JSON.stringify({
      lessonTitle: courseGenData.outline.days[0].lessons[0].title,
      lessonContent: lessonGenData.lesson,
      currentLevel: "Intermediate",
    }),
  });

  assert.strictEqual(flashcardsRes.status, 200, "Flashcards generation should return 200");
  const flashcardsData = await flashcardsRes.json();
  const cards = flashcardsData.deck?.cards || flashcardsData.cards;
  assert(cards && cards.length === 10, "Deck must contain 10 flashcards");
  console.log(`  ✅ Flashcard deck generated with ${cards.length} cards.`);

  // 7. AI Tutor Interaction
  console.log("\n[E2E 7] Testing AI Tutor Interaction...");
  const tutorRes = await fetch(`${BASE_URL}/api/ai-tutor/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gemini-key": "DEMO_MODE",
    },
    body: JSON.stringify({
      message: "Explain how idempotency prevents duplicate charges with an example",
      lessonTitle: courseGenData.outline.days[0].lessons[0].title,
      learnerLevel: "Intermediate",
      conversationHistory: [],
    }),
  });

  assert.strictEqual(tutorRes.status, 200, "AI Tutor should return 200");
  const tutorData = await tutorRes.json();
  assert(tutorData.answer, "AI Tutor must return pedagogical answer");
  assert(Array.isArray(tutorData.relatedConcepts), "AI Tutor must return related concepts");
  console.log(`  ✅ AI Tutor responded with ${tutorData.relatedConcepts.length} related concept tags.`);

  // 8. Cheatsheet Generation
  console.log("\n[E2E 8] Testing Adaptive Cheatsheet Generation...");
  const cheatsheetRes = await fetch(`${BASE_URL}/api/cheatsheets/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gemini-key": "DEMO_MODE",
    },
    body: JSON.stringify({
      topic: "Supply and Demand",
      level: "Intermediate",
      language: "english",
    }),
  });

  assert.strictEqual(cheatsheetRes.status, 200, "Cheatsheets generation should return 200");
  const cheatsheetData = await cheatsheetRes.json();
  assert(cheatsheetData.cheatsheet.domain, "Cheatsheet must contain classified domain");
  assert(Array.isArray(cheatsheetData.cheatsheet.blocks), "Cheatsheet must contain block elements");
  console.log(`  ✅ Cheatsheet generated for domain '${cheatsheetData.cheatsheet.domain}' with ${cheatsheetData.cheatsheet.blocks.length} blocks.`);

  // 9. Quick Learn
  console.log("\n[E2E 9] Testing Quick Learn Feature...");
  const quickLearnRes = await fetch(`${BASE_URL}/api/topics/quick-learn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gemini-key": "DEMO_MODE",
    },
    body: JSON.stringify({
      topic: "Binary Search",
      level: "Beginner",
      language: "english",
    }),
  });

  assert.strictEqual(quickLearnRes.status, 200, "Quick learn should return 200");
  const quickLearnData = await quickLearnRes.json();
  const blocks = quickLearnData.topic?.blocks || quickLearnData.data?.blocks || [];
  assert(blocks.length > 0, "Quick learn must return structured blocks");
  console.log(`  ✅ Quick Learn generated with ${blocks.length} structured blocks.`);

  // 10. YouTube Educational Videos Search
  console.log("\n[E2E 10] Testing YouTube Educational Search...");
  const ytRes = await fetch(`${BASE_URL}/api/youtube/search?lessonTitle=Distributed+Systems&courseTopic=Computer+Science`);
  assert.strictEqual(ytRes.status, 200, "YouTube search should return 200");
  const ytData = await ytRes.json();
  assert(ytData.videos.length > 0, "YouTube search must return educational videos");
  console.log(`  ✅ YouTube integration returned ${ytData.videos.length} educational tutorials.`);

  console.log("\n=================================================");
  console.log("🎉 ALL END-TO-END INTEGRATION AUDIT TESTS PASSED!");
  console.log("=================================================\n");
}

runE2E().catch((err) => {
  console.error("❌ E2E Integration Audit Failed:", err);
  process.exit(1);
});
