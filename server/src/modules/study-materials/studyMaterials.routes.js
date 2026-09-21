import { Router } from "express";
import multer from "multer";
import { analyzeStudyMaterialHandler } from "./studyMaterials.controller.js";
import { authenticateToken } from "../auth/auth.middleware.js";
import { aiRateLimiter } from "../auth/rateLimiter.middleware.js";

const router = Router();

// Configure Multer with memory storage - files are never permanently saved on disk
const storage = multer.memoryStorage();

const EXTENSION_MIME_MAP = {
  ".pdf": ["application/pdf"],
  ".pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ".ppt": ["application/vnd.ms-powerpoint"],
  ".txt": ["text/plain"],
  ".md": ["text/markdown", "text/plain"],
};

const fileFilter = (req, file, cb) => {
  const originalname = (file.originalname || "").toLowerCase();
  const ext = Object.keys(EXTENSION_MIME_MAP).find((e) => originalname.endsWith(e));

  if (!ext) {
    return cb(
      new Error(
        `Invalid file extension: ${file.originalname}. Supported formats are PDF (.pdf), PowerPoint (.ppt, .pptx), and Plain Text (.txt, .md).`
      ),
      false
    );
  }

  const allowedMimes = EXTENSION_MIME_MAP[ext];
  const mime = (file.mimetype || "").toLowerCase();

  if (!allowedMimes.includes(mime)) {
    return cb(
      new Error(
        `Invalid MIME type for ${file.originalname} (${file.mimetype}). File extension and MIME type must match.`
      ),
      false
    );
  }

  cb(null, true);
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
 * Requires authenticateToken.
 */
router.post(
  "/analyze",
  uploadMiddleware,
  authenticateToken,
  aiRateLimiter,
  analyzeStudyMaterialHandler
);

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
