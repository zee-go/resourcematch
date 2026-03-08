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
    const baseUrl =
      req.headers.origin ||
      (req.headers.host ? `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}` : process.env.NEXTAUTH_URL);

    if (!baseUrl) {
      return res.status(500).json({ error: "Could not determine site URL" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: req.company.stripeCustomerId,
      return_url: `${baseUrl}/billing`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Portal session failed: ${message}` });
  }
}

export default withAuth(handler);
