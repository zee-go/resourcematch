import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
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
    email,
    password,
    companyName,
    companyWebsite,
    companySize,
    industry,
    monthlyBudgetMin,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
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
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: companyName || null,
        },
      });

      const company = await tx.company.create({
        data: {
          userId: user.id,
          email,
          companyName: companyName || null,
          companyWebsite: companyWebsite || null,
          companySize: VALID_SIZES.includes(companySize) ? companySize : null,
          industry: industry || null,
          monthlyBudgetMin: monthlyBudgetMin ? parseInt(monthlyBudgetMin) : null,
          verified,
          verifiedAt: verified ? new Date() : null,
          verificationStatus: verified ? "VERIFIED" : "UNVERIFIED",
          verifiedVia: verified ? "email_domain" : null,
          credits: 0,
        },
      });

      return { user, company };
    });

    return res.status(201).json({ success: true, userId: result.user.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Registration failed: ${message}` });
  }
}
