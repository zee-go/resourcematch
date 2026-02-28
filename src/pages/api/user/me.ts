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

  // GET — return company profile
  if (req.method === "GET") {
    try {
      let company = await prisma.company.findUnique({
        where: { supabaseUserId },
        select: {
          id: true,
          email: true,
          companyName: true,
          companyWebsite: true,
          companySize: true,
          industry: true,
          monthlyBudgetMin: true,
          verified: true,
          credits: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          monthlyUnlocksUsed: true,
          monthlyUnlocksLimit: true,
          createdAt: true,
        },
      });

      if (!company) {
        // Auto-create company profile if it doesn't exist yet
        const { data } = await (await import("@/lib/supabase-server")).createSupabaseServerClient(req, res).auth.getUser();
        if (data.user) {
          company = await prisma.company.create({
            data: {
              supabaseUserId,
              email: data.user.email || "",
              companyName: data.user.user_metadata?.company_name || null,
              companyWebsite: data.user.user_metadata?.company_website || null,
              industry: data.user.user_metadata?.industry || null,
              monthlyBudgetMin: data.user.user_metadata?.monthly_budget_min || null,
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
              credits: true,
              subscriptionTier: true,
              subscriptionStatus: true,
              monthlyUnlocksUsed: true,
              monthlyUnlocksLimit: true,
              createdAt: true,
            },
          });
        }
      }

      return res.status(200).json({ company });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ error: `Failed to fetch profile: ${message}` });
    }
  }

  // PATCH — update company profile
  if (req.method === "PATCH") {
    const { companyName, companyWebsite, companySize, industry, monthlyBudgetMin } = req.body;

    try {
      const company = await prisma.company.update({
        where: { supabaseUserId },
        data: {
          ...(companyName !== undefined && { companyName }),
          ...(companyWebsite !== undefined && { companyWebsite }),
          ...(companySize !== undefined && { companySize }),
          ...(industry !== undefined && { industry }),
          ...(monthlyBudgetMin !== undefined && { monthlyBudgetMin: parseInt(monthlyBudgetMin) }),
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
          credits: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          monthlyUnlocksUsed: true,
          monthlyUnlocksLimit: true,
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
