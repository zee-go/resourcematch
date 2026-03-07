import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";
import { uploadAvatar, deleteAvatar } from "@/server/utils/storage";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerAuthSession(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    select: { id: true, avatar: true },
  });

  if (!candidate) {
    return res.status(404).json({ error: "Candidate profile not found" });
  }

  try {
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      maxFiles: 1,
      filter: ({ mimetype }) => ALLOWED_TYPES.includes(mimetype || ""),
    });

    const [, files] = await form.parse(req);
    const file = files.avatar?.[0];

    if (!file) {
      return res.status(400).json({
        error:
          "No valid image file provided. Accepted formats: JPEG, PNG, WebP (max 5MB).",
      });
    }

    const buffer = fs.readFileSync(file.filepath);
    const avatarUrl = await uploadAvatar(
      candidate.id,
      buffer,
      file.mimetype || "image/jpeg"
    );

    // Delete old GCS avatar (skip ui-avatars.com URLs)
    if (
      candidate.avatar &&
      candidate.avatar.includes("storage.googleapis.com")
    ) {
      await deleteAvatar(candidate.avatar);
    }

    await prisma.candidate.update({
      where: { id: candidate.id },
      data: { avatar: avatarUrl },
    });

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({ avatar: avatarUrl });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as any).code === 1009
    ) {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 5MB." });
    }
    console.error("Avatar upload failed:", err);
    return res.status(500).json({ error: "Failed to upload avatar" });
  }
}
