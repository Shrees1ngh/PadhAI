import { tutorChatInputSchema } from "./aiTutor.validator.js";
import { chatWithAITutor } from "../../lib/aiTutor.service.js";

/**
 * Handle contextual chat with AI Tutor for the currently active lesson
 * POST /api/ai-tutor/chat
 */
export const chatWithTutor = async (req, res) => {
  try {
    const apiKey = req.headers["x-gemini-key"] || req.body.apiKey;

    const validatedInput = tutorChatInputSchema.parse({
      ...req.body,
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
    const status = error.status || (error.name === "ZodError" ? 400 : 500);
    res.status(status).json({
      success: false,
      message: error.message || "Failed to generate AI Tutor response",
      code: error.code || "AI_TUTOR_ERROR",
      errors: error.errors || null,
      answer: "I encountered an error while processing your question. Please try again in a moment.",
      relatedConcepts: [],
      suggestedFollowUps: [],
    });
  }
};
