import { extractDocumentText } from "../../lib/documentExtractor.js";
import { analyzeStudyMaterialWithGemini } from "../../lib/studyMaterial.service.js";

/**
 * Controller to handle POST /api/study-materials/analyze
 */
export const analyzeStudyMaterialHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload a PDF, PPT/PPTX, or TXT file.",
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const learnerLevel = req.body?.learnerLevel || "Intermediate";
    const action = req.body?.action || "study-material";
    const customApiKey = req.headers["x-gemini-key"] || req.body?.apiKey;

    // Validate learner level
    const validLevels = ["Beginner", "Intermediate", "Advanced"];
    const normalizedLevel = validLevels.includes(learnerLevel)
      ? learnerLevel
      : "Intermediate";

    // 1. Extract raw text from file buffer
    let extractionResult;
    try {
      extractionResult = await extractDocumentText(buffer, originalname, mimetype);
    } catch (extractErr) {
      return res.status(422).json({
        success: false,
        message: extractErr.message || "Failed to extract readable text from uploaded file.",
      });
    }

    const { text, detectedType, charCount, wordCount } = extractionResult;

    // 2. Synthesize structured learning resources via Gemini
    const analysis = await analyzeStudyMaterialWithGemini({
      documentText: text,
      filename: originalname,
      fileType: detectedType,
      learnerLevel: normalizedLevel,
      action,
      apiKey: customApiKey,
    });

    return res.status(200).json({
      success: true,
      data: analysis,
      analysis: analysis,
      metadata: {
        filename: originalname,
        fileSize: size,
        fileType: detectedType,
        charCount,
        wordCount,
        learnerLevel: normalizedLevel,
        action,
      },
    });
  } catch (err) {
    console.error("Error in analyzeStudyMaterialHandler:", err);
    return res.status(err.status || 500).json({
      success: false,
      code: err.code,
      message: err.message || "Failed to analyze study material. Please try again.",
    });
  }
};
