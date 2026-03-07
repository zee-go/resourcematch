import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Company ID required" });
  }

  if (req.method === "GET") {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, createdAt: true, name: true, failedLoginAttempts: true, lockedUntil: true } },
        _count: { select: { unlocks: true, jobs: true, creditPurchases: true } },
      },
    });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    return res.status(200).json(JSON.parse(JSON.stringify(company)));
  }

  if (req.method === "PATCH") {
    const { verified, verificationStatus, credits } = req.body;
    const data: Record<string, unknown> = {};

    if (typeof verified === "boolean") {
      data.verified = verified;
      data.verifiedAt = verified ? new Date() : null;
      data.verifiedVia = verified ? "admin" : null;
    }
    if (verificationStatus) {
      data.verificationStatus = verificationStatus;
    }
    if (typeof credits === "number") {
      data.credits = credits;
    }

    const company = await prisma.company.update({
      where: { id },
      data,
    });
    return res.status(200).json(JSON.parse(JSON.stringify(company)));
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withRateLimit({ limit: 30, windowSeconds: 60 }, withAdmin(handler));
