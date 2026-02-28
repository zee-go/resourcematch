import type { NextApiResponse } from "next";
import { stripe, CREDIT_PACKS } from "@/server/stripe";
import { withAuth, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";

type PackKey = keyof typeof CREDIT_PACKS;

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { packId } = req.body;

  if (!packId || !(packId in CREDIT_PACKS)) {
    return res.status(400).json({
      error: "Invalid pack. Must be one of: " + Object.keys(CREDIT_PACKS).join(", "),
    });
  }

  const pack = CREDIT_PACKS[packId as PackKey];

  try {
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

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ResourceMatch ${pack.label}`,
              description: `${pack.credits} profile unlock${pack.credits > 1 ? "s" : ""}`,
            },
            unit_amount: pack.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        companyId: req.company.id,
        packId,
        credits: pack.credits.toString(),
        type: "credit_pack",
      },
      success_url: `${req.headers.origin}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payments/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Checkout failed: ${message}` });
  }
}

export default withRateLimit(
  { limit: 10, windowSeconds: 60 },
  withAuth(handler)
);
