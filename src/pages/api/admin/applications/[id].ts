import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Application ID required" });
  }

  if (req.method === "PATCH") {
    const { status } = req.body;
    if (!["PENDING", "REVIEWING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status },
    });
    return res.status(200).json(JSON.parse(JSON.stringify(application)));
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withRateLimit({ limit: 30, windowSeconds: 60 }, withAdmin(handler));
