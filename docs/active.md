# Active Tasks & Reminders

> This file is the source of truth for what's in-flight, what needs checking,
> and what's coming up. Claude reads this at the start of every session and
> surfaces anything due or overdue. Update this file at the end of every
> Claude session.

---

## In Progress

(none — last batch completed)

## Pending

- **Clean up Softgen artifacts** — Remove `@softgenai/element-tagger` dev dep, turbo rules in `next.config.mjs`
- **Wire Stripe payments** — Connect credit pack purchases ($25/100/250) and subscription tiers ($149/$299/$599) to Stripe Checkout
- **Add database** — Candidates, unlocks, user accounts, credit balances. Supabase or similar.
- **Deploy to Vercel** — Connect `zee-go/resourcematch` to Vercel, verify builds
- **Cloudflare DNS setup** — Transfer resourcematch.ph from Wix nameservers, A record → Vercel
- **Complete vetting pipeline** — Add Layer 3 (video interview evaluation) and Layer 4 (reference check) API routes
- **Candidate intake form** — Allow professionals to submit profiles for vetting
- **Blog infrastructure** — Copy MDX system from goscale (blog listing, post page, sitemap, @tailwindcss/typography)
- **Recruitment SEO agent** — New agent in `zee-go/agent` project, Tuesday 10 AM schedule
- **DNS cutover from Wix** — Final migration after all above is complete

### Future Projects

- **[TBD] Multi-country expansion** — Add talent pools for Colombia, India, Ukraine. Same credit economy, new vetting pipelines.
- **[TBD] Worker-side monetization** — Promoted profiles ($5-10/mo), verified skill badges
- **[TBD] EOR/payroll layer** — Malt-style per-worker fees ($29-99/mo) for compliance + payroll

## Scheduled Checks

(none yet)

---

## Completed (Recent)

- **2026-02-28 — Senior talent pivot (full website rebuild)**
  - Repositioned from "Thinking Workers / AI-augmented" to "AI-Vetted Senior Filipino Professionals"
  - Created centralized candidate data model (`src/lib/candidates.ts`) with 10 senior mock candidates
  - Rewrote all landing page sections: Hero, WhyChoose, AIComparison (→ vetting pipeline), HowItWorks
  - Updated dashboard + all sub-components: filters, stats, AI matching, candidate cards
  - Rewrote hire.tsx with new pricing ($25/unlock, $149-$599/mo subscriptions)
  - Rewrote profile/[id].tsx with vetting results, portfolio/case studies, vertical badges
  - Updated UnlockModal ($3→$25, hourlyRate→vettingScore)
  - Updated unlocks.tsx with senior candidate data
  - Built AI vetting pipeline: type definitions, resume analysis API, scenario assessment API
  - Created internal admin vetting page (`/admin/vetting`)
  - Updated CLAUDE.md, active.md, decisions.md

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
