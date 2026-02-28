import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/supabase-server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseUserId = await getAuthUserId(req, res);

  if (!supabaseUserId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const company = await prisma.company.findUnique({
    where: { supabaseUserId },
  });

  if (!company) {
    return res.status(404).json({ error: "Company profile not found" });
  }

  // GET — list user's unlocks
  if (req.method === "GET") {
    try {
      const unlocks = await prisma.unlock.findMany({
        where: { companyId: company.id },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              fullName: true,
              title: true,
              avatar: true,
              vertical: true,
              vettingScore: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { unlockedAt: "desc" },
      });

      return res.status(200).json({ unlocks });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ error: `Failed to fetch unlocks: ${message}` });
    }
  }

  // POST — create a new unlock
  if (req.method === "POST") {
    const { candidateId } = req.body;

    if (!candidateId || typeof candidateId !== "number") {
      return res.status(400).json({ error: "candidateId (number) is required" });
    }

    try {
      // Check if already unlocked
      const existing = await prisma.unlock.findUnique({
        where: {
          companyId_candidateId: {
            companyId: company.id,
            candidateId,
          },
        },
      });

      if (existing) {
        return res.status(409).json({ error: "Already unlocked" });
      }

      // Check company is verified
      if (!company.verified) {
        return res.status(403).json({
          error: "Company not verified",
          message: "Complete your company verification to unlock profiles.",
          action: "verify",
        });
      }

      // Check budget vs candidate salary
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        select: { salaryMin: true, fullName: true, email: true, phone: true },
      });

      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      if (
        company.monthlyBudgetMin &&
        candidate.salaryMin &&
        company.monthlyBudgetMin < candidate.salaryMin
      ) {
        return res.status(403).json({
          error: "Budget mismatch",
          message: "This professional's expected compensation exceeds your stated budget. Update your budget range to proceed.",
          action: "update_budget",
        });
      }

      // Check credits: subscription first, then credit balance
      let deductedFrom: "subscription" | "credits" | null = null;

      if (
        company.subscriptionTier &&
        company.subscriptionStatus === "ACTIVE"
      ) {
        // Unlimited for Enterprise
        if (company.subscriptionTier === "ENTERPRISE") {
          deductedFrom = "subscription";
        } else if (
          company.monthlyUnlocksLimit &&
          company.monthlyUnlocksUsed < company.monthlyUnlocksLimit
        ) {
          deductedFrom = "subscription";
        }
      }

      if (!deductedFrom && company.credits > 0) {
        deductedFrom = "credits";
      }

      if (!deductedFrom) {
        return res.status(402).json({
          error: "No credits",
          message: "You need credits to unlock profiles. Purchase a credit pack or subscribe.",
          action: "buy_credits",
        });
      }

      // Execute unlock in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Deduct credit
        if (deductedFrom === "credits") {
          await tx.company.update({
            where: { id: company.id },
            data: { credits: { decrement: 1 } },
          });
        } else if (deductedFrom === "subscription") {
          await tx.company.update({
            where: { id: company.id },
            data: { monthlyUnlocksUsed: { increment: 1 } },
          });
        }

        // Create unlock
        const unlock = await tx.unlock.create({
          data: {
            companyId: company.id,
            candidateId,
          },
          include: {
            candidate: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                title: true,
              },
            },
          },
        });

        return unlock;
      });

      return res.status(201).json({
        unlock: result,
        deductedFrom,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ error: `Failed to create unlock: ${message}` });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
