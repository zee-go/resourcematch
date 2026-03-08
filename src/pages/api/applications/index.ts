import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withMethods } from "@/server/middleware/withMethods";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { withBodyValidation } from "@/server/middleware/withValidation";
import {
  preScreenApplication,
  convertApplicationToCandidate,
} from "@/server/utils/convert-application";

const applicationSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  vertical: z.enum(["ecommerce", "accounting"]),
  experience: z.number().int().min(5).max(30),
  resumeUrl: z.string().url(),
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

  // Check if a User with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    return res.status(409).json({
      error: "An account with this email already exists.",
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
      resumeUrl: data.resumeUrl,
      skills: data.skills,
      bio: data.bio,
    },
  });

  // Pre-screen and auto-convert if qualified
  const screening = preScreenApplication({
    experience: data.experience,
    skills: data.skills,
    vertical: data.vertical,
    bio: data.bio,
  });

  if (screening.qualified) {
    try {
      const result = await convertApplicationToCandidate(application.id);
      return res.status(201).json({
        success: true,
        id: application.id,
        converted: true,
        candidateId: result.candidateId,
      });
    } catch {
      // Conversion failed — leave as pending for manual review
      return res.status(201).json({
        success: true,
        id: application.id,
        converted: false,
        screeningResult: "qualified",
      });
    }
  }

  return res.status(201).json({
    success: true,
    id: application.id,
    converted: false,
    screeningReason: screening.reason,
  });
}

export default withRateLimit(
  { limit: 5, windowSeconds: 3600 },
  withMethods(["POST"], withBodyValidation(applicationSchema, handler))
);
