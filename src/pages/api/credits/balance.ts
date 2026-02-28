import type { NextApiResponse } from "next";
import { withAuth, type AuthenticatedRequest } from "@/server/middleware/withAuth";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({
    credits: req.company.credits,
    subscription: req.company.subscriptionTier
      ? {
          tier: req.company.subscriptionTier,
          status: req.company.subscriptionStatus,
          monthlyUnlocksUsed: req.company.monthlyUnlocksUsed,
          monthlyUnlocksLimit: req.company.monthlyUnlocksLimit,
        }
      : null,
  });
}

export default withAuth(handler);
