import { Router } from "express";
import multer from "multer";
import { analyzeStudyMaterialHandler } from "./studyMaterials.controller.js";

const router = Router();

// Configure Multer with memory storage - files are never permanently saved on disk
const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = [".pdf", ".ppt", ".pptx", ".txt", ".md"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "application/octet-stream", // Sometimes sent by browsers for certain files
];

const fileFilter = (req, file, cb) => {
  const originalname = (file.originalname || "").toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => originalname.endsWith(ext));
  const hasValidMime =
    ALLOWED_MIME_TYPES.includes(file.mimetype) ||
    file.mimetype.startsWith("text/") ||
    file.mimetype.includes("presentation") ||
    file.mimetype.includes("pdf");

  if (hasValidExt || hasValidMime) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.originalname}. Only PDF (.pdf), PowerPoint (.ppt, .pptx), and Plain Text (.txt) files are supported.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
  fileFilter,
});

// Middleware wrapper for multer error handling
const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single("file");
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File is too large. Maximum allowed file size is 25 MB.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed.",
      });
    }
    next();
  });
};

/**
 * POST /api/study-materials/analyze
 * Analyzes uploaded study material (PDF, PPT/PPTX, TXT) and generates structured study resources.
 */
router.post("/analyze", uploadMiddleware, analyzeStudyMaterialHandler);

// Status / Health check route for this module
router.get("/", (req, res) => {
  res.json({
    module: "study-materials",
    status: "active",
    supportedFormats: ["pdf", "ppt", "pptx", "txt"],
    maxFileSizeMB: 25,
    endpoints: ["POST /api/study-materials/analyze"],
  });
});

export default router;
