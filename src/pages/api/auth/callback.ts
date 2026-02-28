import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { CompanySize } from "@prisma/client";

const VALID_SIZES: CompanySize[] = ["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    supabaseUserId,
    email,
    companyName,
    companyWebsite,
    companySize,
    industry,
    monthlyBudgetMin,
  } = req.body;

  if (!supabaseUserId || !email) {
    return res.status(400).json({ error: "supabaseUserId and email are required" });
  }

  // Auto-verify if business email domain matches company website
  let verified = false;
  if (companyWebsite && email) {
    try {
      const emailDomain = email.split("@")[1]?.toLowerCase();
      const websiteUrl = new URL(
        companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`
      );
      const websiteDomain = websiteUrl.hostname.replace("www.", "").toLowerCase();

      if (emailDomain === websiteDomain) {
        verified = true;
      }
    } catch {
      // Invalid URL, skip auto-verification
    }
  }

  try {
    const company = await prisma.company.upsert({
      where: { supabaseUserId },
      update: {
        companyName: companyName || undefined,
        companyWebsite: companyWebsite || undefined,
        companySize: VALID_SIZES.includes(companySize) ? companySize : undefined,
        industry: industry || undefined,
        monthlyBudgetMin: monthlyBudgetMin ? parseInt(monthlyBudgetMin) : undefined,
        verified,
        verifiedAt: verified ? new Date() : undefined,
      },
      create: {
        supabaseUserId,
        email,
        companyName: companyName || null,
        companyWebsite: companyWebsite || null,
        companySize: VALID_SIZES.includes(companySize) ? companySize : null,
        industry: industry || null,
        monthlyBudgetMin: monthlyBudgetMin ? parseInt(monthlyBudgetMin) : null,
        verified,
        verifiedAt: verified ? new Date() : null,
        credits: 0,
      },
    });

    return res.status(200).json({ success: true, company });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to create company: ${message}` });
  }
}
