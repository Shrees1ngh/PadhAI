import { PDFParse } from "pdf-parse";
import { parseOffice } from "officeparser";
import AdmZip from "adm-zip";

/**
 * Extracts all text from a PPTX file using adm-zip and XML text node parsing.
 * Preserves slide order and slide headings.
 */
const extractTextFromPptxZip = (buffer) => {
  try {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // Find all slide XML entries
    const slideEntries = zipEntries
      .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/i.test(entry.entryName))
      .sort((a, b) => {
        const numA = parseInt(a.entryName.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.entryName.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      });

    if (slideEntries.length === 0) {
      // Fallback: check all XML files inside ppt/
      const generalEntries = zipEntries.filter(
        (e) => e.entryName.startsWith("ppt/") && e.entryName.endsWith(".xml")
      );
      if (generalEntries.length === 0) {
        return "";
      }
      return generalEntries
        .map((entry) => {
          const xml = entry.getData().toString("utf-8");
          return xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        })
        .filter(Boolean)
        .join("\n");
    }

    const slidesText = slideEntries.map((entry, idx) => {
      const xml = entry.getData().toString("utf-8");
      // Extract all <a:t> text tags used by OpenXML for presentation text
      const matches = xml.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
      const slideLines = matches
        .map((tag) => tag.replace(/<[^>]+>/g, "").trim())
        .filter(Boolean);

      // If <a:t> regex didn't catch anything, strip all tags
      if (slideLines.length === 0) {
        const stripped = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        return stripped ? `--- Slide ${idx + 1} ---\n${stripped}` : "";
      }

      return `--- Slide ${idx + 1} ---\n` + slideLines.join("\n");
    });

    return slidesText.filter(Boolean).join("\n\n");
  } catch (err) {
    console.warn("Direct PPTX zip extraction encountered an error:", err.message);
    return "";
  }
};

/**
 * Extract text from PDF buffer using pdf-parse.
 */
const extractTextFromPdf = async (buffer) => {
  try {
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    if (typeof result === "string") {
      return result;
    }
    if (result && typeof result.text === "string") {
      return result.text;
    }
    if (result && Array.isArray(result.pages)) {
      return result.pages.map((p) => p.text || "").join("\n\n");
    }
    return String(result || "");
  } catch (err) {
    console.warn("PDFParse load error, attempting fallback string conversion:", err.message);
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
};

/**
 * Extract text from PPT/PPTX buffer.
 */
const extractTextFromPpt = async (buffer, filename = "") => {
  // First attempt: direct OpenXML zip parsing for PPTX
  const zipText = extractTextFromPptxZip(buffer);
  if (zipText && zipText.trim().length > 30) {
    return zipText;
  }

  // Second attempt: officeparser
  try {
    const parsedOffice = await parseOffice(buffer);
    if (typeof parsedOffice === "string" && parsedOffice.trim().length > 0) {
      return parsedOffice;
    }
  } catch (officeErr) {
    console.warn("officeparser attempt failed:", officeErr.message);
  }

  if (zipText && zipText.trim().length > 0) {
    return zipText;
  }

  throw new Error(
    "Could not extract readable text from presentation file. Please ensure the PPT/PPTX contains extractable text and is not encrypted."
  );
};

/**
 * Extract text from plain text buffer.
 */
const extractTextFromTxt = (buffer) => {
  try {
    return buffer.toString("utf-8");
  } catch (err) {
    try {
      return buffer.toString("latin1");
    } catch {
      throw new Error(`Failed to decode text file: ${err.message}`);
    }
  }
};

/**
 * Main dispatcher to extract text from an uploaded study material buffer.
 *
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} originalname - Original file name
 * @param {string} mimetype - MIME type of the uploaded file
 * @returns {Promise<{ text: string, detectedType: string, charCount: number, wordCount: number }>}
 */
export const extractDocumentText = async (buffer, originalname = "", mimetype = "") => {
  if (!buffer || buffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }

  const lowerName = originalname.toLowerCase();
  let extractedRawText = "";
  let detectedType = "unknown";

  if (lowerName.endsWith(".pdf") || mimetype === "application/pdf") {
    detectedType = "pdf";
    extractedRawText = await extractTextFromPdf(buffer);
  } else if (
    lowerName.endsWith(".pptx") ||
    lowerName.endsWith(".ppt") ||
    mimetype.includes("presentation") ||
    mimetype.includes("powerpoint")
  ) {
    detectedType = lowerName.endsWith(".ppt") ? "ppt" : "pptx";
    extractedRawText = await extractTextFromPpt(buffer, originalname);
  } else if (
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    mimetype.startsWith("text/")
  ) {
    detectedType = "txt";
    extractedRawText = extractTextFromTxt(buffer);
  } else {
    throw new Error(
      `Unsupported file format: ${originalname}. Supported formats are PDF (.pdf), PowerPoint (.ppt, .pptx), and Plain Text (.txt).`
    );
  }

  // Normalize whitespace
  const cleanedText = extractedRawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleanedText.length < 15) {
    throw new Error(
      "Extracted document text is too short or empty. Please ensure your document contains text content (scanned image-only PDFs/PPTs without OCR cannot be read directly)."
    );
  }

  // Safe upper limit for LLM prompt context: ~120,000 characters
  const MAX_CHAR_LIMIT = 120000;
  let finalContent = cleanedText;
  if (cleanedText.length > MAX_CHAR_LIMIT) {
    finalContent =
      cleanedText.slice(0, MAX_CHAR_LIMIT) +
      "\n\n[... Remaining document text truncated to fit model processing limits ...]";
  }

  const wordCount = finalContent.split(/\s+/).filter(Boolean).length;

  return {
    text: finalContent,
    detectedType,
    charCount: finalContent.length,
    wordCount,
  };
};
