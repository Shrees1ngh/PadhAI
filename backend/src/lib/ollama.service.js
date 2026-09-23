import { jsonrepair } from "jsonrepair";
import { ENV } from "../config/env.js";

/**
 * Clean and parse JSON from Ollama raw text output.
 * Strips markdown fences and attempts repair.
 */
const cleanAndParseJson = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response received from Ollama");
  }

  let cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Extract first JSON object/array if there is surrounding text
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      const repaired = jsonrepair(cleaned);
      return JSON.parse(repaired);
    } catch (repairErr) {
      console.error("Ollama JSON repair failed:", cleaned.slice(0, 300));
      const parseErr = new Error(
        `Failed to parse Ollama response into valid JSON: ${repairErr.message}`
      );
      parseErr.status = 502;
      parseErr.code = "AI_OUTPUT_INVALID";
      throw parseErr;
    }
  }
};

/**
 * Build a system prompt that forces Ollama to return strict JSON.
 */
const buildJsonSystemPrompt = (systemInstruction) => {
  const base = `You are a helpful AI assistant. You MUST respond with ONLY valid JSON — no markdown fences, no prose, no explanation outside the JSON object. Respond with the raw JSON object only.`;
  if (systemInstruction) {
    return `${base}\n\n${systemInstruction}`;
  }
  return base;
};

/**
 * Check if the local Ollama server is running.
 * @returns {Promise<boolean>}
 */
export const isOllamaAvailable = async () => {
  try {
    const baseUrl = ENV.OLLAMA_BASE_URL || "http://localhost:11434";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * Main Ollama call function — mirrors the callGemini API surface.
 *
 * @param {Object} options
 * @param {string} options.prompt
 * @param {Object} [options.responseSchema] - Zod schema for validation
 * @param {number} [options.temperature=0.7]
 * @param {string} [options.systemInstruction]
 * @param {string} [options.model] - Override model (uses OLLAMA_MODEL env otherwise)
 * @param {boolean} [options.jsonMode=true]
 */
export const callOllama = async ({
  prompt,
  responseSchema,
  temperature = 0.7,
  systemInstruction,
  model,
  jsonMode = true,
}) => {
  const baseUrl = ENV.OLLAMA_BASE_URL || "http://localhost:11434";
  const activeModel = model || ENV.OLLAMA_MODEL || "qwen2.5:7b";

  const systemPrompt = jsonMode
    ? buildJsonSystemPrompt(systemInstruction)
    : (systemInstruction || "You are a helpful AI assistant.");

  const body = {
    model: activeModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    stream: false,
    options: {
      temperature,
      // Force JSON mode when supported (Ollama 0.3+)
      ...(jsonMode ? { num_predict: 8192 } : {}),
    },
    ...(jsonMode ? { format: "json" } : {}),
  };

  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const controller = new AbortController();
      // 90 second timeout — local models can be slow
      const timeout = setTimeout(() => controller.abort(), 90_000);

      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        const err = new Error(
          `Ollama API error ${res.status}: ${errText.slice(0, 200)}`
        );
        err.status = res.status;

        // 404 = model not pulled yet
        if (res.status === 404) {
          err.code = "OLLAMA_MODEL_NOT_FOUND";
          err.message = `Ollama model "${activeModel}" is not installed. Run: ollama pull ${activeModel}`;
        }
        throw err;
      }

      const data = await res.json();
      const rawOutput = data?.message?.content || data?.response || "";

      if (!rawOutput) {
        throw new Error("Ollama returned an empty response");
      }

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

      const isNetwork =
        error.name === "AbortError" ||
        error.code === "ECONNREFUSED" ||
        error.message?.includes("fetch failed") ||
        error.message?.includes("ECONNREFUSED") ||
        error.message?.includes("aborted");

      if (isNetwork) {
        // Don't retry network errors — fail fast so caller can switch to Gemini
        const err = new Error(
          "Ollama is not running. Please start it with: ollama serve"
        );
        err.status = 503;
        err.code = "OLLAMA_UNAVAILABLE";
        throw err;
      }

      // Model not found — no point retrying
      if (error.code === "OLLAMA_MODEL_NOT_FOUND") throw error;

      // JSON parse errors → retry once with a stricter prompt
      const isJsonError =
        error.code === "AI_OUTPUT_INVALID" ||
        error.message?.includes("Failed to parse") ||
        error instanceof SyntaxError;

      if (isJsonError && attempt < 2) {
        console.warn(`Ollama JSON parse failed, retrying (attempt ${attempt}/2)...`);
        body.messages[1].content = `${prompt}\n\nIMPORTANT: Your previous response was not valid JSON. Respond with ONLY the raw JSON object, no markdown, no extra text.`;
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      // Zod schema errors — don't retry
      if (error.name === "ZodError" || error.issues) {
        const valErr = new Error(
          `Ollama output did not match expected schema: ${(error.issues || []).map((e) => e.message).join(", ")}`
        );
        valErr.status = 502;
        valErr.code = "AI_OUTPUT_INVALID";
        throw valErr;
      }

      throw error;
    }
  }

  const finalError = new Error(lastError?.message || "Ollama request failed");
  finalError.status = lastError?.status || 502;
  finalError.code = lastError?.code || "OLLAMA_ERROR";
  throw finalError;
};
