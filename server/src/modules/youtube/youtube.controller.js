import { searchVideosQuerySchema } from "./youtube.validator.js";
import { fetchEducationalVideos } from "../../lib/youtube.service.js";

/**
 * Search relevant YouTube educational videos for a lesson
 * GET /api/youtube/search
 */
export const searchVideos = async (req, res) => {
  try {
    // Validate query parameters with Zod
    const validatedQuery = searchVideosQuerySchema.parse(req.query);

    // Read optional backend API key header (e.g. if user passes custom key)
    const apiKey = req.headers["x-youtube-key"] || undefined;

    // Fetch educational videos (strictly backend-only API call)
    const result = await fetchEducationalVideos({
      courseTopic: validatedQuery.courseTopic,
      moduleTitle: validatedQuery.moduleTitle,
      lessonTitle: validatedQuery.lessonTitle,
      learningObjective: validatedQuery.learningObjective,
      q: validatedQuery.q,
      maxResults: validatedQuery.maxResults,
      apiKey,
    });

    res.status(200).json({
      success: true,
      message: "Educational videos fetched successfully",
      videos: result.videos,
      count: result.videos.length,
      query: result.query,
      source: result.source,
      warning: result.warning || undefined,
    });
  } catch (error) {
    console.error("Error in searchVideos controller:", error.message);
    const isZod = error.name === "ZodError" || Boolean(error.issues);
    const issues = error.issues || error.errors || [];
    const status = error.status || (isZod ? 400 : 500);
    res.status(status).json({
      success: false,
      message: isZod ? (issues[0]?.message || "Invalid query parameters") : (error.message || "Failed to search educational videos"),
      code: error.code || (isZod ? "VALIDATION_ERROR" : "YOUTUBE_SEARCH_ERROR"),
      errors: issues.length ? issues : null,
      videos: [],
    });
  }
};
