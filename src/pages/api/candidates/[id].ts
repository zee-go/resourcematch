import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const candidateId = Number(id);

  if (isNaN(candidateId)) {
    return res.status(400).json({ error: "Invalid candidate ID" });
  }

  try {
    // Check if user is authenticated and has unlocked this candidate
    const session = await getServerAuthSession(req, res);
    let hasUnlocked = false;

    if (session?.user?.id) {
      const company = await prisma.company.findUnique({
        where: { userId: session.user.id },
      });

      if (company) {
        const unlock = await prisma.unlock.findUnique({
          where: {
            companyId_candidateId: {
              companyId: company.id,
              candidateId,
            },
          },
        });
        hasUnlocked = !!unlock;
      }
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        caseStudies: true,
        certifications: true,
        references: hasUnlocked,
        vettingLayers: {
          select: { layer: true, score: true, passed: true, summary: true },
        },
        vettingProfile: {
          select: { status: true, overallScore: true, completedAt: true },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Strip locked fields if not unlocked
    const { email, phone, linkedIn, videoUrl, resumeUrl, salaryMin, salaryMax, salaryPeriod, englishScore, discProfile, ...publicFields } = candidate;

    if (hasUnlocked) {
      return res.status(200).json({
        candidate: { ...candidate, unlocked: true },
      });
    }

    return res.status(200).json({
      candidate: { ...publicFields, unlocked: false },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch candidate: ${message}` });
  }
}
