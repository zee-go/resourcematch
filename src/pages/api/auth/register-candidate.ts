import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { withMethods } from "@/server/middleware/withMethods";
import { withBodyValidation } from "@/server/middleware/withValidation";
import { withRateLimit } from "@/server/middleware/withRateLimit";

const registerCandidateSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name is required").max(100),
  title: z.string().min(2, "Professional title is required").max(100),
  vertical: z.enum(["ecommerce", "accounting"]),
  experience: z.union([z.string(), z.number()]).transform((v) => Number(v)).pipe(z.number().int().min(1)),
  availability: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  skills: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  location: z.string().min(2, "Location is required").max(100),
  summary: z.string().max(2000).optional(),
  salaryMin: z.union([z.string(), z.number()]).optional(),
  salaryMax: z.union([z.string(), z.number()]).optional(),
});

function generateDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${firstName} ${lastInitial}.`;
}

async function handler(
  req: NextApiRequest & { body: z.infer<typeof registerCandidateSchema> },
  res: NextApiResponse
) {
  const { email, password, fullName, title, vertical, experience, availability, skills, tools, location, summary, salaryMin, salaryMax } = req.body;

  // Check if user already exists — use generic error to prevent user enumeration
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Registration failed. Please try again or sign in." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const displayName = generateDisplayName(fullName);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: fullName,
          role: "CANDIDATE",
        },
      });

      const candidate = await tx.candidate.create({
        data: {
          user: { connect: { id: user.id } },
          name: displayName,
          fullName: fullName.trim(),
          title: title.trim(),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=04443C&color=fff`,
          vertical,
          experience: Number(experience),
          availability,
          skills: Array.isArray(skills) ? skills : [],
          tools: Array.isArray(tools) ? tools : [],
          location: location.trim(),
          rating: 0,
          summary: summary?.trim() || "",
          vettingScore: 0,
          verified: false,
          email,
          salaryMin: salaryMin ? parseInt(String(salaryMin)) : null,
          salaryMax: salaryMax ? parseInt(String(salaryMax)) : null,
        },
      });

      return { user, candidate };
    });

    return res.status(201).json({ success: true, userId: result.user.id });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
}

export default withRateLimit(
  { limit: 5, windowSeconds: 60 },
  withMethods(["POST"], withBodyValidation(registerCandidateSchema, handler))
);
