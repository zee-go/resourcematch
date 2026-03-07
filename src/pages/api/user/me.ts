import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession(req, res);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = session.user.id;

  // GET — return company profile
  if (req.method === "GET") {
    try {
      const company = await prisma.company.findUnique({
        where: { userId },
        select: {
          id: true,
          email: true,
          companyName: true,
          companyWebsite: true,
          companySize: true,
          industry: true,
          monthlyBudgetMin: true,
          verified: true,
          verificationStatus: true,
          credits: true,
          freeUnlocksUsed: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          monthlyUnlocksUsed: true,
          monthlyUnlocksLimit: true,
          matchingEnabled: true,
          matchingVertical: true,
          matchingExperience: true,
          matchingSkills: true,
          createdAt: true,
        },
      });

      return res.status(200).json({ company });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ error: `Failed to fetch profile: ${message}` });
    }
  }

  // PATCH — update company profile
  if (req.method === "PATCH") {
    const { companyName, companyWebsite, companySize, industry, monthlyBudgetMin,
      matchingEnabled, matchingVertical, matchingExperience, matchingSkills } = req.body;

    try {
      const company = await prisma.company.update({
        where: { userId },
        data: {
          ...(companyName !== undefined && { companyName }),
          ...(companyWebsite !== undefined && { companyWebsite }),
          ...(companySize !== undefined && { companySize }),
          ...(industry !== undefined && { industry }),
          ...(monthlyBudgetMin !== undefined && { monthlyBudgetMin: parseInt(monthlyBudgetMin) }),
          ...(matchingEnabled !== undefined && { matchingEnabled: Boolean(matchingEnabled) }),
          ...(matchingVertical !== undefined && { matchingVertical: matchingVertical || null }),
          ...(matchingExperience !== undefined && { matchingExperience: matchingExperience || null }),
          ...(matchingSkills !== undefined && { matchingSkills }),
        },
        select: {
          id: true,
          email: true,
          companyName: true,
          companyWebsite: true,
          companySize: true,
          industry: true,
          monthlyBudgetMin: true,
          verified: true,
          verificationStatus: true,
          credits: true,
          freeUnlocksUsed: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          monthlyUnlocksUsed: true,
          monthlyUnlocksLimit: true,
          matchingEnabled: true,
          matchingVertical: true,
          matchingExperience: true,
          matchingSkills: true,
          createdAt: true,
        },
      });

      return res.status(200).json({ company });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ error: `Failed to update profile: ${message}` });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
