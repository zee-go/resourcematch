import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

/** Credit pack definitions */
export const CREDIT_PACKS = {
  pack_1: { credits: 1, priceInCents: 2500, label: "1 Unlock" },
  pack_5: { credits: 5, priceInCents: 10000, label: "5 Unlocks" },
  pack_15: { credits: 15, priceInCents: 25000, label: "15 Unlocks" },
} as const;

/** Subscription tier definitions */
export const SUBSCRIPTION_TIERS = {
  STARTER: {
    monthlyUnlocks: 10,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
    label: "Starter",
  },
  GROWTH: {
    monthlyUnlocks: 25,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID ?? "",
    label: "Growth",
  },
  ENTERPRISE: {
    monthlyUnlocks: 999, // effectively unlimited
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
    label: "Enterprise",
  },
} as const;
