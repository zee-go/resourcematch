import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";
import { convertApplicationToCandidate } from "@/server/utils/convert-application";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Application ID required" });
  }

  if (req.method === "PATCH") {
    const { status, title, availability, location } = req.body;
    if (!["PENDING", "REVIEWING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status },
    });

    // Auto-convert to Candidate when admin approves
    if (status === "APPROVED") {
      try {
        const result = await convertApplicationToCandidate(id, {
          title,
          availability,
          location,
        });
        return res.status(200).json({
          ...JSON.parse(JSON.stringify(application)),
          converted: true,
          candidateId: result.candidateId,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Conversion failed";
        return res.status(200).json({
          ...JSON.parse(JSON.stringify(application)),
          converted: false,
          conversionError: message,
        });
      }
    }

    return res.status(200).json(JSON.parse(JSON.stringify(application)));
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withRateLimit({ limit: 30, windowSeconds: 60 }, withAdmin(handler));
