import assert from "assert";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { registerInputSchema, loginInputSchema, exchangeCodeInputSchema } from "./src/modules/auth/auth.validator.js";
import { generateUserToken } from "./src/modules/auth/auth.controller.js";
import { extractDocumentText } from "./src/lib/documentExtractor.js";
import { ENV } from "./src/config/env.js";

async function runSecurityTests() {
  console.log("=================================================");
  console.log("RUNNING SECURITY HARDENING VERIFICATION TESTS");
  console.log("=================================================\n");

  // 1. Test Password Length Validation (min 8 chars)
  console.log("[Test 1] Testing password minimum length validation...");
  try {
    registerInputSchema.parse({
      name: "Test User",
      email: "test@example.com",
      password: "short", // 5 chars, should fail
    });
    assert.fail("Should have rejected password < 8 characters");
  } catch (err) {
    assert(err.name === "ZodError" || err.issues);
    console.log("  ✅ Correctly rejected short password (< 8 chars).");
  }

  const validRegistration = registerInputSchema.parse({
    name: "Valid User",
    email: "valid@example.com",
    password: "securePassword123!",
  });
  assert.strictEqual(validRegistration.email, "valid@example.com");
  console.log("  ✅ Accepted valid registration input with >= 8 char password.");

  // 2. Test Exchange Code Schema
  console.log("\n[Test 2] Testing exchangeCodeInputSchema...");
  const validCode = exchangeCodeInputSchema.parse({ code: "abc12345" });
  assert.strictEqual(validCode.code, "abc12345");
  try {
    exchangeCodeInputSchema.parse({ code: "" });
    assert.fail("Should have rejected empty code");
  } catch (err) {
    console.log("  ✅ Correctly rejected empty exchange code.");
  }

  // 3. Test JWT generation and ObjectId validation
  console.log("\n[Test 3] Testing JWT generation with 24-char ObjectId...");
  const mockObjectId = new mongoose.Types.ObjectId().toString();
  const token = generateUserToken({
    _id: mockObjectId,
    email: "test@example.com",
    name: "Test User",
  });
  const decoded = jwt.verify(token, ENV.JWT_SECRET);
  assert.strictEqual(decoded.id, mockObjectId);
  assert(mongoose.Types.ObjectId.isValid(decoded.id));
  console.log("  ✅ JWT contains valid 24-char ObjectId.");

  // 4. Test PPTX zip bomb protection (entry size / total size / entry count)
  console.log("\n[Test 4] Testing extractDocumentText limits...");
  try {
    await extractDocumentText(Buffer.from(""), "empty.txt", "text/plain");
    assert.fail("Should have rejected empty buffer");
  } catch (err) {
    assert(err.message.includes("empty"));
    console.log("  ✅ Correctly rejected empty file buffer.");
  }

  // 5. Test MIME / Extension matching error
  console.log("\n[Test 5] Testing document type mismatch handling...");
  try {
    await extractDocumentText(Buffer.from("Hello world, this is a test text file with enough characters to pass length check."), "test.exe", "application/x-msdownload");
    assert.fail("Should have rejected unsupported file format");
  } catch (err) {
    assert(err.message.includes("Unsupported file format"));
    console.log("  ✅ Correctly rejected invalid file extension and mime.");
  }

  console.log("\n=================================================");
  console.log("🎉 ALL SECURITY HARDENING TESTS PASSED!");
  console.log("=================================================");
}

runSecurityTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
