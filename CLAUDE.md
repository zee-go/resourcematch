# ResourceMatch

B2B marketplace connecting international companies with **AI-vetted senior Filipino professionals** (5-10+ years experience). Curated talent platform with a 4-layer AI vetting pipeline across specialized industry verticals.

## Positioning

**"AI-Vetted Senior Talent"** — curated senior professionals, rigorously vetted by AI, across specialized industry verticals.

Core message: "Hire Senior Filipino Professionals, Vetted by AI"

Key differentiators:
- 4-layer AI vetting pipeline: Resume Analysis → Scenario Assessment → Video Interview → Reference Verification
- Senior-only talent pool (5-10+ years experience, no entry-level)
- Vertical specialization: Finance & Accounting, Operations Management (Healthcare Admin and Digital Marketing deferred to month 6+)
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
  schema.prisma              # Database schema (17 models — see below)
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
    apply.tsx                # Candidate intake/application page
    jobs/
      index.tsx              # Browse job listings (public)
      post.tsx               # Create a free job posting (company)
      manage.tsx             # Manage posted jobs (company)
      [id].tsx               # View job details
      [id]/edit.tsx          # Edit job posting
    candidate/
      profile.tsx            # Candidate profile management
      applications.tsx       # Candidate's application history
    admin/vetting.tsx        # Internal: AI vetting pipeline admin tool
    404.tsx                  # Not found page
    payments/
      success.tsx            # Post-checkout success
      cancel.tsx             # Post-checkout cancel
    api/
      health.ts              # Health check endpoint
      auth/[...nextauth].ts  # NextAuth dynamic route handler
      auth/register.ts       # User registration + company creation
      auth/register-candidate.ts # Candidate user registration
      user/me.ts             # Company profile CRUD
      candidate/
        me.ts                # Candidate profile CRUD
        applications.ts      # Candidate's applications list
      candidates/
        index.ts             # Search/filter candidates (public)
        [id].ts              # Single candidate (locked fields hidden unless unlocked)
      jobs/
        index.ts             # List + create jobs
        [id].ts              # Job details + update
        [id]/applications/
          index.ts           # Job applications list
          [applicationId].ts # Manage single application
      applications/
        index.ts             # Create application (candidate applies to job)
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
      companies/
        verify.ts            # Admin: manually verify a company
        verify-ai.ts         # AI-powered company verification
    _app.tsx                 # App wrapper with AuthProvider + ErrorBoundary
    _document.tsx            # HTML document + SEO

  components/
    Hero.tsx                 # Landing hero
    WhyChoose.tsx            # Value prop cards
    AIComparison.tsx         # 4-layer vetting pipeline showcase
    HowItWorks.tsx           # 2-tab process (companies/professionals)
    Footer.tsx               # Site footer (legal links, platform nav, contact)
    LandingHeader.tsx        # Landing page navigation header
    UnlockModal.tsx          # Credit-based unlock dialog with inline credit plans
    LogoIcon.tsx             # Brand logo SVG component (primary/white/accent)
    SEO.tsx                  # SEO head component (SVG favicon, branded OG image)
    ThemeSwitch.tsx          # Dark mode toggle
    dashboard/
      DashboardHeader.tsx    # Nav + auth status + credits badge
      AIBanner.tsx           # AI matching CTA banner
      AIMatchModal.tsx       # AI-powered talent matching form
      SearchFilters.tsx      # Search + vertical/experience/skill filters
      CandidateResults.tsx   # Candidate grid with unlock integration
      StatsCards.tsx         # Platform stats
    jobs/
      JobCard.tsx            # Job listing card component
      JobForm.tsx            # Job creation/edit form
      JobSearchFilters.tsx   # Job search + filters
      ApplicationCard.tsx    # Job application card component
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

### Prisma Models

User, Account, Session, VerificationToken, Company, Candidate, CaseStudy, Reference, VettingProfile, VettingLayerResult, Unlock, CreditPurchase, SavedCandidate, CompanyRating, Application, Job, JobApplication

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
| Finance & Accounting | QuickBooks, financial modeling, compliance |
| Operations Management | Shopify, Amazon, inventory, fulfillment, logistics |

Future verticals (month 6+): Healthcare Admin, Digital Marketing

## Current State

- Full backend: 33 API routes, 17 Prisma models, NextAuth.js, Stripe payments
- Frontend: 24 pages — landing, dashboard, profile, unlocks, hire, billing, jobs (CRUD), candidate portal, apply intake, privacy, terms
- Database: 10 seeded candidates with vetting profiles, Cloud SQL PostgreSQL
- Free job posting: companies post jobs, candidates apply, application management pipeline
- Candidate accounts: separate registration, profile management, application tracking
- AI company verification: automated legitimacy checks via Claude API
- UnlockModal with inline credit plan selection + post-purchase redirect back to profile
- Stripe Checkout wired for credit packs + subscriptions (returnTo flow)
- Brand logo: LogoIcon component renders actual ResourceMatch lettermark SVG (Raw Sienna accent in headers)
- Favicon: SVG primary + PNG fallback, branded OG image (web devices mockup)
- Logo assets in `public/`: logo-icon.svg, logo-icon-white.svg, logo-icon-accent.svg, logo-horizontal.png, logo-horizontal-white.png
- Security: Account lockout (5 failed logins → 15min lock), Zod-validated registration, rate-limited auth endpoints, CSP without unsafe-eval
- Password reset flow: forgot-password + reset-password API routes using VerificationToken
- Admin check uses JWT email (case-insensitive), not mutable company email
- Global ErrorBoundary in _app.tsx, robots.txt, sitemap.xml, Privacy Policy, Terms of Service
- Footer component on landing page with legal links + platform nav
- "Browse Jobs" nav link restricted to candidate role only
- Deployed to GCP Cloud Run: `resourcematch-vimf2wal7a-as.a.run.app`
- Cloud SQL seeded, Secret Manager configured, Cloud Build CI/CD
- Last deployed: 2026-03-06 (commit 7e61bdf)
- Domain: resourcematch.ph
- GitHub: zee-go/resourcematch

## Guardrails

- Verify before irreversible actions (publishing, deleting, sending)
- Ask for clarification when context is ambiguous
- Never delete or overwrite important data without confirmation
