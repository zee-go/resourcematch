import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { withAuth, type AuthenticatedRequest } from "@/server/middleware/withAuth";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const purchases = await prisma.creditPurchase.findMany({
      where: { companyId: req.company.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.status(200).json({ purchases });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch history: ${message}` });
  }
}

export default withAuth(handler);
