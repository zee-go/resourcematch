import type { NextApiResponse } from "next";
import { stripe } from "@/server/stripe";
import { withAuth, type AuthenticatedRequest } from "@/server/middleware/withAuth";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!req.company.stripeCustomerId) {
    return res.status(400).json({
      error: "No billing account found. Purchase credits first.",
    });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: req.company.stripeCustomerId,
      return_url: `${req.headers.origin}/billing`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Portal session failed: ${message}` });
  }
}

export default withAuth(handler);
