# ResourceMatch

B2B marketplace connecting international companies with **AI-vetted senior Filipino professionals** (5-10+ years experience). Curated talent platform with a 4-layer AI vetting pipeline across specialized industry verticals.

## Positioning

**"AI-Vetted Senior Talent"** — curated senior professionals, rigorously vetted by AI, across specialized industry verticals.

Core message: "Hire Senior Filipino Professionals, Vetted by AI"

Key differentiators:
- 4-layer AI vetting pipeline: Resume Analysis → Scenario Assessment → Video Interview → Reference Verification
- Senior-only talent pool (5-10+ years experience, no entry-level)
- Vertical specialization: Accounting & Finance, E-commerce Operations (Healthcare Admin and Digital Marketing deferred to month 6+)
- Portfolio-style profiles with case studies and vetting scores
- Pay-per-unlock pricing ($25/profile) + subscription plans

## Tech Stack

- **Framework**: Next.js 15.2.8, React 18.3.1, TypeScript 5
- **Database**: Prisma ORM + PostgreSQL (Cloud SQL on GCP)
- **Auth**: NextAuth.js 4.24 (CredentialsProvider, JWT sessions, PrismaAdapter)
- **UI**: Tailwind CSS 3.4.1, shadcn/ui (New York style), 48+ Radix UI primitives
- **Fonts**: Montserrat (headings), Karla (body), JetBrains Mono (code)
- **Colors**: Evening Sea `#04443C` (primary), Raw Sienna `#D38B53` (accent), Lochinvar `#399A8B` (secondary), Iceberg `#DBF3EB` (light)
- **Animations**: Framer Motion, custom fade-in/slide-up/scale-in
- **Icons**: Lucide React
- **AI**: Claude API (Anthropic) for vetting pipeline
- **Payments**: Stripe Checkout (redirect, zero PCI scope)
- **Forms**: React Hook Form + Zod validation
- **Deployment**: GCP Cloud Run (Docker, Cloud Build CI/CD)

## Code Structure

```
prisma/
  schema.prisma              # Database schema (Company, Candidate, Unlock, etc.)
  seed.ts                    # Seed 10 mock candidates

src/
  pages/
    index.tsx                # Landing (Hero + WhyChoose + AIComparison + HowItWorks)
    hire.tsx                 # Pricing — credit packs + subscriptions (wired to Stripe)
    dashboard.tsx            # Search + AI matching + candidate grid (from DB)
    unlocks.tsx              # Unlocked profiles history (from DB)
    billing.tsx              # Credit balance, subscription, purchase history
    profile/[id].tsx         # Full candidate profile + vetting results
    login.tsx                # NextAuth email/password login
    signup.tsx               # 2-step signup (credentials → company details)
    admin/vetting.tsx        # Internal: AI vetting pipeline admin tool
    payments/
      success.tsx            # Post-checkout success
      cancel.tsx             # Post-checkout cancel
    api/
      auth/[...nextauth].ts  # NextAuth dynamic route handler
      auth/register.ts       # User registration + company creation
      user/me.ts             # Company profile CRUD
      candidates/
        index.ts             # Search/filter candidates (public)
        [id].ts              # Single candidate (locked fields hidden unless unlocked)
      unlocks/
        index.ts             # List + create unlocks (atomic credit transactions)
        [id].ts              # Mark contacted
        export.ts            # CSV export
      credits/
        balance.ts           # Credit count + subscription info
        history.ts           # Purchase history
      payments/
        checkout.ts          # Stripe Checkout for credit packs
        subscription.ts      # Stripe Checkout for subscriptions
        portal.ts            # Stripe Customer Portal
      webhooks/stripe.ts     # Signature-verified Stripe webhooks
      vetting/
        resume-analysis.ts   # Layer 1: AI resume analysis via Claude API
        scenario-assessment.ts # Layer 2: AI scenario questions
        video-interview.ts   # Layer 3: Video interview evaluation
        reference-check.ts   # Layer 4: Reference verification
        evaluate-response.ts # Layer 2 supplement: scenario answer scoring
      companies/verify.ts    # Admin: manually verify a company
    _app.tsx                 # App wrapper with AuthProvider
    _document.tsx            # HTML document + SEO

  components/
    Hero.tsx                 # Landing hero
    WhyChoose.tsx            # Value prop cards
    AIComparison.tsx         # 4-layer vetting pipeline showcase
    HowItWorks.tsx           # 2-tab process (companies/professionals)
    UnlockModal.tsx          # Credit-based unlock dialog (calls /api/unlocks)
    SEO.tsx                  # SEO head component
    ThemeSwitch.tsx          # Dark mode toggle
    dashboard/
      DashboardHeader.tsx    # Nav + auth status + credits badge
      AIBanner.tsx           # AI matching CTA banner
      AIMatchModal.tsx       # AI-powered talent matching form
      SearchFilters.tsx      # Search + vertical/experience/skill filters
      CandidateResults.tsx   # Candidate grid with unlock integration
      StatsCards.tsx          # Platform stats
    ui/                      # shadcn/ui primitives

  server/
    stripe.ts                # Stripe client + credit pack/subscription tier configs
    middleware/
      withAuth.ts            # NextAuth session + admin middleware
      withMethods.ts         # HTTP method restriction
      withValidation.ts      # Zod body/query validation
      withRateLimit.ts       # In-memory IP+route rate limiter
    utils/
      api-error.ts           # ApiError class + handler

  lib/
    prisma.ts                # Prisma client singleton
    auth.ts                  # NextAuth config (CredentialsProvider, PrismaAdapter)
    stripe-client.ts         # Client-side loadStripe singleton
    candidates.ts            # Mock candidate data (fallback)
    vetting-types.ts         # TypeScript interfaces for AI vetting pipeline
    utils.ts                 # cn() classname merger

  contexts/
    AuthProvider.tsx          # Auth context (user, company, credits, signOut)
    ThemeProvider.tsx          # Dark mode context

  env.ts                     # @t3-oss/env-nextjs validated env vars

  styles/
    globals.css              # Tailwind + CSS variables + fonts
```

## Pricing Model

- **Free**: Browse all profiles (contact info locked)
- **Credit Packs**: 1/$25 · 5/$100 (best value) · 15/$250 (never expire)
- **Starter**: $149/mo — 10 unlocks, AI matching, priority support
- **Growth**: $299/mo — 25 unlocks, advanced filters, dedicated matching
- **Enterprise**: $599/mo — unlimited unlocks, API access, account manager

Future layers: promoted profiles, background checks, EOR/payroll

## AI Vetting Pipeline

4-layer evaluation process for all candidates:

1. **Resume Analysis** — AI evaluates career trajectory, experience years, red flags, vertical fit
2. **Scenario Assessment** — AI-generated role-specific scenario questions per vertical
3. **Video Interview** — Communication, professionalism, English proficiency evaluation
4. **Reference Verification** — Manager/colleague reference checks with structured ratings

Each layer produces a 0-100 score. Composite vetting score determines candidate ranking.

## Industry Verticals (Active)

| Vertical | Focus Areas |
|----------|-------------|
| Accounting & Finance | QuickBooks, financial modeling, compliance |
| E-commerce Operations | Shopify, Amazon, inventory, fulfillment |

Future verticals (month 6+): Healthcare Admin, Digital Marketing

## Current State

- Full backend: 21 API routes, Prisma schema, NextAuth.js, Stripe payments
- Database: 10 seeded candidates with vetting profiles
- Frontend connected to API: dashboard, profile, unlocks, hire, billing
- UnlockModal uses credit system (raw card form removed)
- Stripe Checkout wired for credit packs + subscriptions
- GCP deployment ready: Dockerfile, cloudbuild.yaml, security headers
- Domain: resourcematch.ph
- GitHub: zee-go/resourcematch

## Guardrails

- Verify before irreversible actions (publishing, deleting, sending)
- Ask for clarification when context is ambiguous
- Never delete or overwrite important data without confirmation
