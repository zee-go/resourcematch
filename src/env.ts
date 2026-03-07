import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
    STRIPE_STARTER_PRICE_ID: z.string().startsWith("price_").optional(),
    STRIPE_GROWTH_PRICE_ID: z.string().startsWith("price_").optional(),
    STRIPE_ENTERPRISE_PRICE_ID: z.string().startsWith("price_").optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    ADMIN_EMAILS: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().startsWith("re_").optional(),
    MATCHING_DIGEST_SECRET: z.string().min(16).optional(),
    JOB_SYNC_SECRET: z.string().min(16).optional(),
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID,
    STRIPE_GROWTH_PRICE_ID: process.env.STRIPE_GROWTH_PRICE_ID,
    STRIPE_ENTERPRISE_PRICE_ID: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    MATCHING_DIGEST_SECRET: process.env.MATCHING_DIGEST_SECRET,
    JOB_SYNC_SECRET: process.env.JOB_SYNC_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
