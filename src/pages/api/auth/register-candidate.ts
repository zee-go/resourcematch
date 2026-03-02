import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Vertical, Availability } from "@prisma/client";

const VALID_VERTICALS: Vertical[] = ["ecommerce", "accounting"];
const VALID_AVAILABILITY: Availability[] = ["FULL_TIME", "PART_TIME", "CONTRACT"];

function generateDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${firstName} ${lastInitial}.`;
}

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
    fullName,
    title,
    vertical,
    experience,
    availability,
    skills,
    tools,
    location,
    summary,
    salaryMin,
    salaryMax,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  if (!fullName?.trim()) {
    return res.status(400).json({ error: "Full name is required" });
  }

  if (!title?.trim()) {
    return res.status(400).json({ error: "Professional title is required" });
  }

  if (!VALID_VERTICALS.includes(vertical)) {
    return res.status(400).json({ error: "Valid vertical is required" });
  }

  if (!experience || experience < 1) {
    return res.status(400).json({ error: "Years of experience is required" });
  }

  if (!VALID_AVAILABILITY.includes(availability)) {
    return res.status(400).json({ error: "Valid availability is required" });
  }

  if (!location?.trim()) {
    return res.status(400).json({ error: "Location is required" });
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
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
          userId: user.id,
          name: displayName,
          fullName: fullName.trim(),
          title: title.trim(),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=04443C&color=fff`,
          vertical,
          experience: parseInt(experience),
          availability,
          skills: Array.isArray(skills) ? skills : [],
          tools: Array.isArray(tools) ? tools : [],
          location: location.trim(),
          rating: 0,
          summary: summary?.trim() || "",
          vettingScore: 0,
          verified: false,
          email,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
        },
      });

      return { user, candidate };
    });

    return res.status(201).json({ success: true, userId: result.user.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Registration failed: ${message}` });
  }
}
