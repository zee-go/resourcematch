import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { stripe, SUBSCRIPTION_TIERS } from "@/server/stripe";
import { prisma } from "@/lib/prisma";
import type { SubscriptionTier } from "@prisma/client";

// Disable Next.js body parsing — Stripe needs the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const companyId = session.metadata?.companyId;
  if (!companyId) return;

  if (session.metadata?.type === "credit_pack") {
    const credits = parseInt(session.metadata.credits || "0", 10);
    if (credits <= 0) return;

    await prisma.$transaction([
      prisma.company.update({
        where: { id: companyId },
        data: { credits: { increment: credits } },
      }),
      prisma.creditPurchase.create({
        data: {
          companyId,
          credits,
          amountCents: session.amount_total || 0,
          stripeSessionId: session.id,
          stripePaymentIntent: session.payment_intent as string,
          type: "CREDIT_PACK",
        },
      }),
    ]);
  }

  if (session.metadata?.type === "subscription") {
    const tier = session.metadata.tier as SubscriptionTier;
    const tierConfig = SUBSCRIPTION_TIERS[tier];

    if (!tierConfig) return;

    await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionId: session.subscription as string,
        subscriptionTier: tier,
        subscriptionStatus: "ACTIVE",
        monthlyUnlocksLimit: tierConfig.monthlyUnlocks,
        monthlyUnlocksUsed: 0,
        billingCycleStart: new Date(),
      },
    });
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Monthly subscription renewal — reset unlock count
  if (invoice.subscription) {
    const company = await prisma.company.findFirst({
      where: { subscriptionId: invoice.subscription as string },
    });

    if (company) {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          subscriptionStatus: "ACTIVE",
          monthlyUnlocksUsed: 0,
          billingCycleStart: new Date(),
        },
      });
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const company = await prisma.company.findFirst({
    where: { subscriptionId: subscription.id },
  });

  if (!company) return;

  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    trialing: "TRIALING",
  };

  await prisma.company.update({
    where: { id: company.id },
    data: {
      subscriptionStatus: (statusMap[subscription.status] || "ACTIVE") as any,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const company = await prisma.company.findFirst({
    where: { subscriptionId: subscription.id },
  });

  if (!company) return;

  await prisma.company.update({
    where: { id: company.id },
    data: {
      subscriptionId: null,
      subscriptionTier: null,
      subscriptionStatus: "CANCELED",
      monthlyUnlocksLimit: null,
      monthlyUnlocksUsed: 0,
    },
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return res.status(400).json({ error: `Webhook error: ${message}` });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        // Unhandled event type — log but don't error
        console.log(`Unhandled webhook event: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }

  return res.status(200).json({ received: true });
}
