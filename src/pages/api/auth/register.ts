import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { withMethods } from "@/server/middleware/withMethods";
import { withBodyValidation } from "@/server/middleware/withValidation";
import { withRateLimit } from "@/server/middleware/withRateLimit";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().max(200).optional(),
  companyWebsite: z.string().url().or(z.string().max(200)).optional(),
  companySize: z.enum(["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).optional(),
  industry: z.string().max(100).optional(),
  monthlyBudgetMin: z.union([z.string(), z.number()]).optional(),
});

async function handler(
  req: NextApiRequest & { body: z.infer<typeof registerSchema> },
  res: NextApiResponse
) {
  const { email, password, companyName, companyWebsite, companySize, industry, monthlyBudgetMin } = req.body;

  // Check if user already exists — use generic error to prevent user enumeration
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Registration failed. Please try again or sign in." });
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
          companySize: companySize || null,
          industry: industry || null,
          monthlyBudgetMin: monthlyBudgetMin ? parseInt(String(monthlyBudgetMin)) : null,
          verified,
          verifiedAt: verified ? new Date() : null,
          verificationStatus: verified ? "VERIFIED" : "UNVERIFIED",
          verifiedVia: verified ? "email_domain" : null,
          credits: 2,
        },
      });

      return { user, company };
    });

    return res.status(201).json({ success: true, userId: result.user.id });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
}

export default withRateLimit(
  { limit: 5, windowSeconds: 60 },
  withMethods(["POST"], withBodyValidation(registerSchema, handler))
);
