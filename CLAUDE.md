# ResourceMatch

B2B marketplace connecting international companies with **AI-vetted senior Filipino professionals** (5-10+ years experience). Curated talent platform with a 4-layer AI vetting pipeline across specialized industry verticals.

## Positioning

**"AI-Vetted Senior Talent"** — curated senior professionals, rigorously vetted by AI, across specialized industry verticals.

Core message: "Hire Senior Filipino Professionals, Vetted by AI"

Key differentiators:
- 4-layer AI vetting pipeline: Resume Analysis → Scenario Assessment → Video Interview → Reference Verification
- Senior-only talent pool (5-10+ years experience, no entry-level)
- Vertical specialization: E-commerce Operations, Healthcare Admin, Accounting & Finance, Digital Marketing
- Portfolio-style profiles with case studies and vetting scores
- Pay-per-unlock pricing ($25/profile) — no subscriptions required

## Tech Stack

- **Framework**: Next.js 15.2.8, React 18.3.1, TypeScript 5
- **UI**: Tailwind CSS 3.4.1, shadcn/ui (New York style), 48+ Radix UI primitives
- **Fonts**: Bricolage Grotesque (headings/body), JetBrains Mono (code)
- **Colors**: Forest green primary `#2D5F3F`, burnt sienna accent `#D97642`
- **Animations**: Framer Motion, custom fade-in/slide-up/scale-in
- **Icons**: Lucide React
- **AI**: Claude API (Anthropic) for vetting pipeline
- **Payments**: Stripe (not yet wired)
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel (vercel.json configured)

## Code Structure

```
src/
  pages/
    index.tsx              # Landing (Hero + WhyChoose + AIComparison + HowItWorks)
    hire.tsx               # Pricing page — credit packs + subscriptions
    dashboard.tsx          # Search + AI matching + candidate grid
    unlocks.tsx            # Unlocked profiles history
    profile/[id].tsx       # Full candidate profile + vetting results
    admin/vetting.tsx      # Internal: AI vetting pipeline admin tool
    api/
      hello.ts             # Example API route
      vetting/
        resume-analysis.ts    # Layer 1: AI resume analysis via Claude API
        scenario-assessment.ts # Layer 2: AI scenario question generation
    _app.tsx               # App wrapper
    _document.tsx          # HTML document + SEO
    404.tsx                # Custom 404

  components/
    Hero.tsx               # Landing hero — "AI-Vetted Senior Talent" messaging
    WhyChoose.tsx          # 4 value prop cards (vetting, experience, verticals, portfolios)
    AIComparison.tsx       # 4-layer vetting pipeline showcase
    HowItWorks.tsx         # 2-tab process (companies/professionals)
    UnlockModal.tsx        # Payment/unlock dialog ($25/unlock)
    SEO.tsx                # SEO head component
    ThemeSwitch.tsx        # Dark mode toggle
    dashboard/
      DashboardHeader.tsx
      AIBanner.tsx         # AI matching CTA banner
      AIMatchModal.tsx     # AI-powered talent matching form
      SearchFilters.tsx    # Search + vertical/experience/skill filters
      CandidateResults.tsx # Candidate grid with vetting scores
      StatsCards.tsx       # Platform stats (200+ vetted, 4-layer, $25/unlock)
    ui/                    # shadcn/ui primitives

  lib/
    candidates.ts          # Centralized candidate data model + 10 senior mock candidates
    vetting-types.ts       # TypeScript interfaces for AI vetting pipeline
    utils.ts               # cn() classname merger

  contexts/
    ThemeProvider.tsx       # Dark mode context

  hooks/
    use-toast.ts
    use-mobile.tsx

  styles/
    globals.css            # Tailwind + CSS variables
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

## Industry Verticals

| Vertical | Focus Areas |
|----------|-------------|
| E-commerce Operations | Shopify, Amazon, inventory, fulfillment |
| Healthcare Admin | Medical billing, HIPAA, EHR systems |
| Accounting & Finance | QuickBooks, financial modeling, compliance |
| Digital Marketing | Google Ads, SEO, content strategy |

## Current State

- Mock data (10 senior candidates in centralized model, no real database)
- AI vetting API routes built (require ANTHROPIC_API_KEY in .env.local)
- Stripe not integrated yet
- Domain: resourcematch.ph (currently on Wix, migrating to Vercel)
- GitHub: zee-go/resourcematch

## Competitors

| Platform | Model | Our advantage |
|----------|-------|---------------|
| Staffy (₱9,990/mo) | AI employee | No judgment, no accountability |
| HireAI | AI employee | Gets stuck on edge cases, no relationships |
| OnlineJobs.ph ($69-99/mo) | Flat subscription | No vetting, no pay-as-you-go |
| VirtualStaff.ph ($29-199/mo) | EOR per worker | Heavy operations, no AI vetting |
| Malt.es | 15-20% commission | EU-focused, no PH specialization |

## Session Memory System

| File | Purpose | Update frequency |
|------|---------|-----------------|
| `docs/active.md` | Task tracker — in-flight, pending, completed | Every session |
| `docs/decisions.md` | Decision log — what was decided and why | When decisions are made |

### Session Protocol

1. **Start**: Read `docs/active.md` — surface anything due or overdue
2. **During**: Update active.md as tasks progress; log decisions
3. **End**: Ensure both files reflect what happened
4. **External work**: If user mentions work done outside Claude, log it

## Guardrails

- Verify before irreversible actions (publishing, deleting, sending)
- Ask for clarification when context is ambiguous
- Never delete or overwrite important data without confirmation
