import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Job ID required" });
  }

  if (req.method === "PATCH") {
    const { status } = req.body;
    if (!["OPEN", "CLOSED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Use OPEN or CLOSED." });
    }

    const data: Record<string, unknown> = { status };
    if (status === "CLOSED") {
      data.closedAt = new Date();
    } else {
      data.closedAt = null;
      data.publishedAt = new Date();
    }

    const job = await prisma.job.update({
      where: { id },
      data,
    });
    return res.status(200).json(JSON.parse(JSON.stringify(job)));
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withRateLimit({ limit: 30, windowSeconds: 60 }, withAdmin(handler));
