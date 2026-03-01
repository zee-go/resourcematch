# Active Tasks & Reminders

> This file is the source of truth for what's in-flight, what needs checking,
> and what's coming up. Claude reads this at the start of every session and
> surfaces anything due or overdue. Update this file at the end of every
> Claude session.

---

## In Progress

- **Deploy to GCP Cloud Run** — Dockerfile ready, Cloud SQL + Artifact Registry + Secret Manager all provisioned. Need to build image, deploy service, seed DB, map domain.

## Pending

- **Cloudflare DNS setup** — Transfer resourcematch.ph from Wix nameservers, map to Cloud Run
- **Stripe test mode verification** — Create test products/prices in Stripe Dashboard, end-to-end test with 4242 card
- **Candidate intake form** — Allow professionals to submit profiles for vetting
- **Blog infrastructure** — Copy MDX system from goscale (blog listing, post page, sitemap, @tailwindcss/typography)
- **Recruitment SEO agent** — New agent in `zee-go/agent` project, Tuesday 10 AM schedule

### Future Projects

- **[TBD] Multi-country expansion** — Add talent pools for Colombia, India, Ukraine. Same credit economy, new vetting pipelines.
- **[TBD] Worker-side monetization** — Promoted profiles ($5-10/mo), verified skill badges
- **[TBD] EOR/payroll layer** — Malt-style per-worker fees ($29-99/mo) for compliance + payroll

## Scheduled Checks

(none yet)

---

## Completed (Recent)

- **2026-02-28 — Vetting pipeline complete (all 4 layers)**
  - Created Layer 3 (video-interview.ts) and Layer 4 (reference-check.ts) API routes
  - Created evaluate-response.ts for scenario answer scoring
  - Added Prisma persistence to all 4 vetting routes (upsert to VettingLayerResult)
  - Added Video Interview and Reference Check tabs to admin/vetting.tsx
  - Added request types (VideoInterviewRequest, ReferenceCheckRequest, ScenarioEvaluationRequest)

- **2026-02-28 — Softgen cleanup**
  - Deleted logs/ directory, added to .gitignore
  - Rewrote README.md (was "# Your Softgen App")

- **2026-02-28 — Documentation update**
  - Updated CLAUDE.md: replaced Supabase references with NextAuth.js, added new vetting routes
  - Updated active.md: reflected completed tasks

- **2026-02-28 — Full backend infrastructure**
  - Database: Prisma schema with 14 models, PostgreSQL on Cloud SQL
  - Auth: Migrated from Supabase Auth to NextAuth.js (CredentialsProvider, JWT, PrismaAdapter)
  - API: 21 routes (candidates, unlocks, credits, payments, vetting, auth, admin)
  - Stripe: Checkout, webhook, portal, credits — fully wired
  - Pages: dashboard, profile, unlocks, billing, hire — all using getServerSideProps with Prisma
  - Docker: Multi-stage Dockerfile for Cloud Run deployment

- **2026-02-28 — Senior talent pivot (full website rebuild)**
  - Repositioned from "Thinking Workers / AI-augmented" to "AI-Vetted Senior Filipino Professionals"
  - Created centralized candidate data model with 10 senior mock candidates
  - Rewrote all landing page sections: Hero, WhyChoose, AIComparison, HowItWorks
  - Updated dashboard + all sub-components
  - Built AI vetting pipeline: type definitions, resume analysis API, scenario assessment API
  - Created internal admin vetting page (`/admin/vetting`)

---

## How This File Works

**Sections:**
- **In Progress** — actively being worked on across sessions
- **Pending** — queued work, not yet started
- **Scheduled Checks** — recurring or future reviews (date = when due)
- **Completed (Recent)** — finished items, kept for ~30 days then removed

**Rules:**
- Dates in brackets are due dates, not start dates
- Move items down as they progress: In Progress → Pending Review → Completed
- Remove completed items older than 30 days (they're in git history)
- If an item spawns new work, add the new item and complete the original
- Use [TBD] for items without a set review date
