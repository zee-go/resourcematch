import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

/**
 * Admin endpoint to manually verify a company.
 * In production, this should be protected by admin authentication.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { companyId, verified } = req.body;

  if (!companyId) {
    return res.status(400).json({ error: "companyId is required" });
  }

  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        verified: verified !== false,
        verifiedAt: verified !== false ? new Date() : null,
      },
    });

    return res.status(200).json({ success: true, company });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to verify company: ${message}` });
  }
}
