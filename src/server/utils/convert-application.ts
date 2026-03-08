import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generateDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

interface ConvertOptions {
  title?: string;
  availability?: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  location?: string;
}

/**
 * Converts an Application record into a User + Candidate in a transaction.
 * Returns the created candidate ID or throws on error.
 */
export async function convertApplicationToCandidate(
  applicationId: string,
  options: ConvertOptions = {}
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Check if a User with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: application.email },
  });
  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  // Generate a random password (candidate will need to reset)
  const tempPassword = crypto.randomBytes(16).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: application.email,
        passwordHash,
        name: application.fullName,
        role: "CANDIDATE",
      },
    });

    const candidate = await tx.candidate.create({
      data: {
        user: { connect: { id: user.id } },
        name: generateDisplayName(application.fullName),
        fullName: application.fullName.trim(),
        title: (options.title || "Professional").trim(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(application.fullName)}&background=04443C&color=fff`,
        vertical: application.vertical,
        experience: application.experience,
        availability: options.availability || "FULL_TIME",
        skills: application.skills,
        tools: [],
        location: (options.location || "Philippines").trim(),
        rating: 0,
        summary: application.bio?.trim() || "",
        vettingScore: 0,
        verified: false,
        email: application.email,
        phone: application.phone,
        linkedIn: application.linkedInUrl,
        resumeUrl: application.resumeUrl || null,
      },
    });

    await tx.application.update({
      where: { id: application.id },
      data: { status: "APPROVED" },
    });

    return { userId: user.id, candidateId: candidate.id };
  });

  return result;
}

// Vertical-specific keywords for pre-screening
const VERTICAL_KEYWORDS: Record<string, string[]> = {
  accounting: [
    "accounting", "finance", "bookkeeping", "quickbooks", "xero", "tax",
    "audit", "payroll", "financial", "cpa", "gaap", "reconciliation",
    "accounts payable", "accounts receivable", "budgeting", "reporting",
  ],
  ecommerce: [
    "ecommerce", "e-commerce", "shopify", "amazon", "operations",
    "inventory", "fulfillment", "logistics", "supply chain", "warehouse",
    "customer service", "order management", "marketplace", "woocommerce",
  ],
};

/**
 * Simple pre-screen check — no AI call needed for basic qualification.
 * Returns true if the application meets minimum criteria.
 */
export function preScreenApplication(application: {
  experience: number;
  skills: string[];
  vertical: string;
  bio: string | null;
}): { qualified: boolean; reason?: string } {
  // Must have 5+ years experience (matches platform positioning)
  if (application.experience < 5) {
    return { qualified: false, reason: "Less than 5 years experience" };
  }

  // Must have at least 2 skills
  if (application.skills.length < 2) {
    return { qualified: false, reason: "Insufficient skills listed" };
  }

  // Bio must be substantive (at least 50 chars)
  if (!application.bio || application.bio.trim().length < 50) {
    return { qualified: false, reason: "Bio too short" };
  }

  // Check if skills match the declared vertical
  const verticalKeywords = VERTICAL_KEYWORDS[application.vertical] || [];
  const allText = [
    ...application.skills.map((s) => s.toLowerCase()),
    (application.bio || "").toLowerCase(),
  ].join(" ");

  const matchCount = verticalKeywords.filter((kw) => allText.includes(kw)).length;
  if (matchCount < 2) {
    return { qualified: false, reason: "Skills don't match declared vertical" };
  }

  return { qualified: true };
}
