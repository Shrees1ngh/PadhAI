import { tutorChatInputSchema } from "./aiTutor.validator.js";
import { chatWithAITutor } from "../../lib/aiTutor.service.js";

/**
 * Handle contextual chat with AI Tutor for the currently active lesson
 * POST /api/ai-tutor/chat
 */
export const chatWithTutor = async (req, res) => {
  try {
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;
    const conversationHistory = req.body.conversationHistory || req.body.history || [];
    const learnerLevel = req.body.learnerLevel || req.body.currentLevel || req.body.level || "Beginner";

    const validatedInput = tutorChatInputSchema.parse({
      ...req.body,
      learnerLevel,
      conversationHistory,
      apiKey,
    });

    const response = await chatWithAITutor({
      message: validatedInput.message,
      courseTitle: validatedInput.courseTitle,
      moduleTitle: validatedInput.moduleTitle,
      lessonTitle: validatedInput.lessonTitle,
      learningObjective: validatedInput.learningObjective,
      lessonContent: validatedInput.lessonContent,
      learnerLevel: validatedInput.learnerLevel,
      conversationHistory: validatedInput.conversationHistory,
      apiKey,
    });

    res.status(200).json({
      success: true,
      message: "AI Tutor response generated",
      answer: response.answer,
      relatedConcepts: response.relatedConcepts || [],
      suggestedFollowUps: response.suggestedFollowUps || [],
      isOutsideLessonScope: response.isOutsideLessonScope || false,
    });
  } catch (error) {
    console.error("Error in chatWithTutor controller:", error.message);
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    const status = error.status || (isZod ? 400 : 500);
    res.status(status).json({
      success: false,
      message: isZod ? (issues[0]?.message || "Invalid input for AI Tutor chat") : (error.message || "Failed to generate AI Tutor response"),
      code: error.code || (isZod ? "VALIDATION_ERROR" : "AI_TUTOR_ERROR"),
      errors: issues.length ? issues : null,
    });
  }
};
