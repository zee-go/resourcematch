import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withMethods } from "@/server/middleware/withMethods";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { withBodyValidation } from "@/server/middleware/withValidation";

const applicationSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  vertical: z.enum(["ecommerce", "accounting"]),
  experience: z.number().int().min(5).max(30),
  resumeText: z.string().min(50).max(10000),
  skills: z.array(z.string()).min(1),
  bio: z.string().min(20).max(1000),
});

async function handler(
  req: NextApiRequest & { body: z.infer<typeof applicationSchema> },
  res: NextApiResponse
) {
  const data = req.body;

  // Check for duplicate pending application
  const existing = await prisma.application.findFirst({
    where: { email: data.email, status: "PENDING" },
  });
  if (existing) {
    return res.status(409).json({
      error: "An application with this email is already under review.",
    });
  }

  const application = await prisma.application.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      linkedInUrl: data.linkedInUrl || null,
      vertical: data.vertical,
      experience: data.experience,
      resumeText: data.resumeText,
      skills: data.skills,
      bio: data.bio,
    },
  });

  return res.status(201).json({ success: true, id: application.id });
}

export default withRateLimit(
  { limit: 5, windowSeconds: 3600 },
  withMethods(["POST"], withBodyValidation(applicationSchema, handler))
);
