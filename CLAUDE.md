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
- **Colors**: All colors use CSS variable tokens via Tailwind — never hardcode hex values in components
  - `primary` / `primary-dark` — Evening Sea `#04443C` / `#022C27`
  - `accent` / `accent-dark` — Raw Sienna `#D38B53` / `#B47646`
  - `secondary` — Lochinvar `#399A8B`
  - `light` — Iceberg `#DBF3EB`
  - Semantic status colors (green/red/yellow/blue) are allowed for success/error/pending/info states only
- **Animations**: Framer Motion, custom fade-in/slide-up/scale-in
- **Icons**: Lucide React
- **AI**: Claude API (Anthropic) for vetting pipeline
- **Blog**: MDX files in `content/blog/`, rendered via next-mdx-remote + gray-matter + reading-time
- **SEO Agent**: Kelly — Python agent in `scripts/seo/`, runs weekly via launchd, generates blog content via Claude API
- **Payments**: Stripe Checkout (redirect, zero PCI scope)
- **Forms**: React Hook Form + Zod validation
- **Deployment**: GCP Cloud Run (Docker, Cloud Build CI/CD)

## Code Structure

```
prisma/
  schema.prisma              # Database schema (18 models — see below)
  seed.ts                    # Seed 10 mock candidates (demo data cleared in prod)

src/
  pages/
    blog/
      index.tsx              # Blog listing with category filters (SSG + ISR)
      [slug].tsx             # Blog article with MDX rendering (SSG + ISR)
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
      index.tsx              # Browse job listings — unified native + external (public)
      post.tsx               # Create a free job posting (company)
      manage.tsx             # Manage posted jobs (company)
      [id].tsx               # View native job details
      [id]/edit.tsx          # Edit job posting
      ext/[id].tsx           # External job detail page (Apply on Source + signup CTA)
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
        sync.ts              # Daily external job sync (Bearer token, Cloud Scheduler)
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
      matching/
        digest.ts            # Weekly talent digest (Cloud Scheduler, Bearer token auth)
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
      MatchingPreferences.tsx # Weekly talent alerts toggle + filter preferences
    blog/
      BlogCard.tsx           # Blog listing card (hero image, category, title, date)
      BlogHero.tsx           # Article header (category, title, metadata, hero image)
      CTABanner.tsx          # Mid-article CTA — registered as MDX component
      BlogImage.tsx          # MDX image component with next/image + credit
      RelatedPosts.tsx       # Related articles grid (3 cards)
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
      recalculate-vetting.ts # Auto-recalculate vettingScore from layer results

  lib/
    prisma.ts                # Prisma client singleton
    auth.ts                  # NextAuth config (CredentialsProvider, PrismaAdapter)
    stripe-client.ts         # Client-side loadStripe singleton
    blog.ts                  # Blog utilities (getAllPosts, getPostBySlug, getRelatedPosts)
    blog-seo.ts              # Article JSON-LD + Breadcrumb structured data
    analytics.ts             # GA4 event tracking helpers (wraps gtag, SSR-safe)
    job-fetchers.ts          # External job API fetchers (Remotive + RemoteOK)
    job-types.ts             # Job type definitions (JobSummary, ExternalJobSummary, UnifiedJobSummary)
    candidates.ts            # Mock candidate data (fallback)
    vetting-types.ts         # TypeScript interfaces for AI vetting pipeline
    utils.ts                 # cn() classname merger

  contexts/
    AuthProvider.tsx          # Auth context (user, company, credits, signOut)
    ThemeProvider.tsx          # Dark mode context

  env.ts                     # @t3-oss/env-nextjs validated env vars

  styles/
    globals.css              # Tailwind + CSS variables + fonts + .prose-blog styles

content/
  blog/                      # MDX blog posts (committed to git, deployed with app)
    *.mdx                    # Frontmatter (title, slug, category, keywords) + Markdown content

scripts/
  seo/                       # Kelly SEO agent (Python)
    main.py                  # Weekly orchestrator: plan → generate → approve → publish
    topic_researcher.py      # Claude-based keyword/topic research (5 content pillars)
    content_planner.py       # Weekly content calendar (2 blog posts, Tue + Thu)
    content_generator.py     # Claude writes full SEO-optimized posts (ResourceMatch voice)
    page_writer.py           # Writes MDX files to content/blog/
    publisher.py             # git commit + push → Cloud Build deploy
    image_client.py          # Unsplash API for hero/mid images
    search_console.py        # Google Search Console weekly traffic data
    traffic_tracker.py       # Traffic history persistence
    state.py                 # Published content + keyword coverage tracking
    formatter.py             # Telegram message formatting
    telegram.py              # SEO bot wrapper (reuses existing bot)
    config.py                # Secret loader (scripts/data/secrets.json → GCP fallback)
    telegram_client.py       # TelegramClient class
    health.py                # Failure notification via Telegram
    logging_setup.py         # Logging config → scripts/logs/seo.log
  requirements.txt           # Python deps (anthropic, requests, google-api-python-client)
  schedules/                 # launchd plist (Monday 11:00 AM)
  data/                      # (gitignored) secrets.json, seo_state.json, seo_calendar.json
  logs/                      # (gitignored) agent log files
```

### Prisma Models

User, Account, Session, VerificationToken, Company, Candidate, CaseStudy, Reference, VettingProfile, VettingLayerResult, Unlock, CreditPurchase, SavedCandidate, CompanyRating, Application, Job, JobApplication, ExternalJob

## Pricing Model

- **Free**: Browse all profiles (contact info locked) + 2 free unlocks on signup
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

Each layer produces a 0-100 score. Composite vetting score = average of all completed layer scores, auto-recalculated via `recalculateVettingScore()` utility whenever a layer result is saved. When all 4 layers complete with scores >= 70, candidate is auto-verified. Video interview layer also flows `englishProficiency` → `Candidate.englishScore` (basic=40, intermediate=60, advanced=80, native=95).

## Industry Verticals (Active)

| Vertical | Focus Areas |
|----------|-------------|
| Finance & Accounting | QuickBooks, financial modeling, compliance |
| Operations Management | Shopify, Amazon, inventory, fulfillment, logistics |

Future verticals (month 6+): Healthcare Admin, Digital Marketing

## Current State

- Full backend: 35 API routes, 18 Prisma models, NextAuth.js, Stripe payments
- Frontend: 27 pages — landing, dashboard, profile, unlocks, hire, billing, jobs (CRUD + external detail), candidate portal, apply intake, blog (listing + article), privacy, terms
- Database: 10 seeded candidates with vetting profiles, Cloud SQL PostgreSQL (demo jobs cleared)
- Free job posting: companies post jobs, candidates apply, application management pipeline
- External job aggregation: Remotive + RemoteOK APIs synced daily at 6 AM Manila (Cloud Scheduler), filtered to accounting/finance + operations management only, keyword-based vertical classifier, `ExternalJob` model separate from native `Job`, unified listing on `/jobs`, external detail page at `/jobs/ext/[id]` with "Apply on Source" + ResourceMatch signup CTA
- Candidate accounts: separate registration, profile management (with profile health indicator), application tracking
- Candidate profile: 8-section completeness tracker (Personal Info, Contact Details, Professional Details, Skills & Tools, Video Intro, Resume, Case Studies, References), inline CRUD for case studies (max 5) and references (max 5), contact fields (phone, LinkedIn, video URL, resume URL), AI Vetting Status section showing composite score + 4-layer results
- Browse cards: summary snippet, reference count badge, case study count, vetting score — no star rating (removed, was always 0)
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
- Blog section: `/blog` listing with category filters, `/blog/[slug]` article pages with MDX rendering
- Blog content pillars: Outsourcing Strategy, Finance & Accounting, Operations Management, Hiring Best Practices, Industry Insights
- Blog prose styles (`.prose-blog`) use brand design tokens — no hardcoded colors
- Blog SEO: Article JSON-LD, Breadcrumb JSON-LD, OG article type, published/modified time meta
- Kelly SEO agent: Python in `scripts/seo/`, runs Monday 11AM via launchd, generates 2 blog posts/week
- Kelly workflow: traffic report (GSC) → topic research (Claude) → content plan → Telegram approval → generate post (Claude) → source images (Unsplash) → preview → approve → git push → Cloud Build deploy
- Kelly reuses existing SEO Telegram bot for approval workflow
- Free trial: 2 free unlocks on company signup (credits: 2), `freeUnlocksUsed` tracks usage, free trial messaging in UnlockModal + Hero + dashboard welcome banner
- GA4 conversion tracking: `src/lib/analytics.ts` wraps `gtag()` with typed helpers, events tracked across signup funnel, unlock funnel, profile views, search/filters, AI match, purchases, CTA clicks, user properties (user_type, subscription_tier)
- Automated matching emails: Company model has `matchingEnabled/matchingVertical/matchingExperience/matchingSkills/lastMatchEmailSent` fields, `MatchingPreferences` component on dashboard, `/api/matching/digest` endpoint secured by Bearer token for Cloud Scheduler, `sendMatchDigest()` in email.ts
- Deployed to GCP Cloud Run: `resourcematch-vimf2wal7a-as.a.run.app`
- Cloud SQL seeded, Secret Manager configured, Cloud Build CI/CD (manual `gcloud builds submit` — no auto-trigger configured)
- Cloud Scheduler jobs: `matching-digest` (Mon 10AM), `job-sync` (daily 6AM Manila)
- Vetting score auto-recalculation: `src/server/utils/recalculate-vetting.ts` called by all 4 vetting endpoints after upsert, updates Candidate.vettingScore + VettingProfile + verified status + englishScore
- Last deployed: 2026-03-07 (commit 7887316)
- Domain: `resourcematch.ph` — Cloudflare DNS (zone `f55cc59b877aee0c0f5e92c2bdccaa1a`) → GCP Cloud Run domain mapping
  - A records (x4) → `216.239.x.x` (Google domain mapping IPs, DNS-only)
  - `www` CNAME → `ghs.googlehosted.com` (DNS-only)
  - MX records → Google Workspace (unchanged)
  - SSL: Google-managed certificate via Cloud Run domain mapping
- GitHub: zee-go/resourcematch

## Guardrails

- Verify before irreversible actions (publishing, deleting, sending)
- Ask for clarification when context is ambiguous
- Never delete or overwrite important data without confirmation
