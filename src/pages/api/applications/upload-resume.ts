import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import crypto from "crypto";
import { PDFDocument } from "pdf-lib";
import { uploadResume } from "@/server/utils/storage";
import { withMethods } from "@/server/middleware/withMethods";
import { withRateLimit } from "@/server/middleware/withRateLimit";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PAGES = 2;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      maxFiles: 1,
      filter: ({ mimetype }) => mimetype === "application/pdf",
    });

    const [fields, files] = await form.parse(req);
    const file = files.resume?.[0];

    if (!file) {
      return res
        .status(400)
        .json({ error: "No valid PDF file provided. Accepted format: PDF (max 5MB)." });
    }

    const buffer = fs.readFileSync(file.filepath);

    // Validate page count
    let pageCount: number;
    try {
      const pdf = await PDFDocument.load(buffer);
      pageCount = pdf.getPageCount();
    } catch {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: "Could not read PDF. Please upload a valid PDF file." });
    }

    if (pageCount > MAX_PAGES) {
      fs.unlinkSync(file.filepath);
      return res
        .status(400)
        .json({ error: `Resume must be ${MAX_PAGES} pages or fewer. Yours has ${pageCount} pages.` });
    }

    // Use email hash as identifier, or random bytes
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const identifier = email
      ? crypto.createHash("sha256").update(email).digest("hex").slice(0, 16)
      : crypto.randomBytes(8).toString("hex");

    const resumeUrl = await uploadResume(identifier, buffer);

    fs.unlinkSync(file.filepath);

    return res.status(200).json({ resumeUrl, pageCount });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 1009) {
      return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
    }
    console.error("Resume upload failed:", err);
    return res.status(500).json({ error: "Failed to upload resume" });
  }
}

export default withRateLimit(
  { limit: 10, windowSeconds: 3600 },
  withMethods(["POST"], handler)
);
