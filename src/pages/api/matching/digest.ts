/**
 * Weekly matching digest endpoint.
 * Secured by Bearer token — called by GCP Cloud Scheduler.
 *
 * Setup:
 *   gcloud scheduler jobs create http matching-digest \
 *     --schedule="0 10 * * 1" \
 *     --uri="https://resourcematch.ph/api/matching/digest" \
 *     --http-method=POST \
 *     --headers="Authorization=Bearer <MATCHING_DIGEST_SECRET>" \
 *     --location=asia-southeast1
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { sendMatchDigest } from "@/lib/email";
import type { Prisma } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.MATCHING_DIGEST_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Digest not configured" });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Invalid authorization" });
  }

  try {
    const companies = await prisma.company.findMany({
      where: {
        matchingEnabled: true,
        verified: true,
      },
      include: {
        unlocks: { select: { candidateId: true } },
      },
    });

    let emailsSent = 0;

    for (const company of companies) {
      const where: Prisma.CandidateWhereInput = {};

      if (company.matchingVertical) {
        where.vertical = company.matchingVertical;
      }

      if (company.matchingExperience) {
        const exp = company.matchingExperience;
        if (exp === "5-7") where.experience = { gte: 5, lte: 7 };
        else if (exp === "8-10") where.experience = { gte: 8, lte: 10 };
        else if (exp === "10+") where.experience = { gte: 10 };
      }

      // Exclude already-unlocked candidates
      const unlockedIds = company.unlocks.map((u) => u.candidateId);
      if (unlockedIds.length > 0) {
        where.id = { notIn: unlockedIds };
      }

      // Only include candidates added/updated since last email
      if (company.lastMatchEmailSent) {
        where.updatedAt = { gte: company.lastMatchEmailSent };
      }

      const candidates = await prisma.candidate.findMany({
        where,
        select: {
          id: true,
          name: true,
          title: true,
          vertical: true,
          experience: true,
          vettingScore: true,
          skills: true,
        },
        orderBy: { vettingScore: "desc" },
        take: 5,
      });

      if (candidates.length === 0) continue;

      // Post-query skills filter
      let filtered = candidates;
      if (company.matchingSkills.length > 0) {
        filtered = candidates.filter((c) =>
          company.matchingSkills.some((skill) =>
            c.skills.some((cs) =>
              cs.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }

      if (filtered.length === 0) continue;

      sendMatchDigest(
        company.email,
        company.companyName || "Your Company",
        filtered.map((c) => ({
          id: c.id,
          name: c.name,
          title: c.title,
          vertical: c.vertical,
          experience: c.experience,
          vettingScore: c.vettingScore,
          skills: c.skills,
        }))
      );

      await prisma.company.update({
        where: { id: company.id },
        data: { lastMatchEmailSent: new Date() },
      });

      emailsSent++;
    }

    return res.status(200).json({
      success: true,
      companiesProcessed: companies.length,
      emailsSent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Digest failed:", message);
    return res.status(500).json({ error: `Digest failed: ${message}` });
  }
}
