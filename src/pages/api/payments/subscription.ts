import type { NextApiResponse } from "next";
import { stripe, SUBSCRIPTION_TIERS } from "@/server/stripe";
import { withAuth, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";

type TierKey = keyof typeof SUBSCRIPTION_TIERS;

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tier } = req.body;

  if (!tier || !(tier in SUBSCRIPTION_TIERS)) {
    return res.status(400).json({
      error: "Invalid tier. Must be one of: " + Object.keys(SUBSCRIPTION_TIERS).join(", "),
    });
  }

  const tierConfig = SUBSCRIPTION_TIERS[tier as TierKey];

  if (!tierConfig.priceId) {
    return res.status(500).json({
      error: "Subscription price not configured for this tier",
    });
  }

  // Check if already subscribed
  if (req.company.subscriptionStatus === "ACTIVE") {
    return res.status(409).json({
      error: "Already subscribed. Use the billing portal to manage your subscription.",
      action: "portal",
    });
  }

  try {
    const baseUrl =
      req.headers.origin ||
      (req.headers.host ? `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}` : process.env.NEXTAUTH_URL);

    if (!baseUrl) {
      return res.status(500).json({ error: "Could not determine site URL" });
    }

    // Get or create Stripe customer
    let stripeCustomerId = req.company.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.company.email,
        metadata: {
          companyId: req.company.id,
          companyName: req.company.companyName || "",
        },
      });

      stripeCustomerId = customer.id;

      await prisma.company.update({
        where: { id: req.company.id },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: tierConfig.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        companyId: req.company.id,
        tier,
        type: "subscription",
      },
      success_url: `${baseUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payments/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Subscription checkout failed: ${message}` });
  }
}

export default withRateLimit(
  { limit: 5, windowSeconds: 60 },
  withAuth(handler)
);
