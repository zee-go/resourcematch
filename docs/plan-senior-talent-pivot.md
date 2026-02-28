# ResourceMatch Strategic Plan: Senior Filipino Talent Platform

> Created: 2026-02-28
> Updated: 2026-02-28
> Status: Active

---

## Vision

Become the go-to platform for hiring **mid-senior Filipino professionals** (5-10+ years experience) with AI-powered vetting that gives employers confidence they're hiring proven talent — not rolling the dice on a resume.

**One-liner:** "Hire senior Filipino professionals. Vetted by AI. Ready in 48 hours."

---

## Phase 1: Foundation (Weeks 1-3)

### 1.1 Repositioning & Rebrand
- [ ] Retire "Thinking Workers" / "AI-augmented" headline messaging
- [ ] New positioning: senior vetted talent, not VAs
- [ ] Update landing page (Hero, WhyChoose, HowItWorks) to reflect senior talent focus
- [ ] Remove or rework AIComparison component — no longer the core differentiator
- [ ] Evaluate name change (ResourceMatch → something that signals quality/seniority)
- [ ] Update pricing to reflect senior talent value ($25-50/unlock, concierge tier)

### 1.2 Define Target Verticals (Two-Vertical Focus)
- [ ] Primary: **Accounting & Finance** (CPAs, senior bookkeepers, financial analysts, controllers)
  - 200,000+ CPAs in Philippines, trained on IFRS/GAAP
  - Target: SGV/EY PH, KPMG Manila, Deloitte PH alumni
  - US/UK/AU accountant shortage creates strong demand
  - Salary arbitrage: PH senior CPA earns $900-1,400/mo local → $2,000-3,500/mo remote
- [ ] Primary: **E-commerce Operations** (senior ops managers, supply chain, PPC strategists)
  - Deep BPO alumni pipeline (Accenture, Concentrix, Teleperformance)
  - Growing D2C/e-commerce demand for ops leadership
  - BPO ops managers earn $1,250-1,800/mo local → $2,500-4,000/mo remote
- [ ] Build role-specific landing pages for each vertical
- [ ] **Month 6+ expansion (only if demand signals warrant):** Healthcare Admin, Digital Marketing

### 1.3 Candidate Profile Redesign
- [ ] Redesign profile page for senior professionals (portfolio-style, not resume dump)
- [ ] Remove hourly rate field — replace with salary range/negotiable
- [ ] Add: career timeline, key achievements, leadership experience, tools mastery
- [ ] Add: verification badges (AI-vetted, references checked, video verified)
- [ ] Add: confidential mode (for currently employed candidates)

---

## Phase 2: AI Vetting Pipeline (Weeks 3-6)

### 2.1 Layer 1 — Automated Application Screening
- [ ] Resume/LinkedIn parser using Claude API — extract structured career data
- [ ] Career trajectory scoring (progression, company quality, tenure patterns)
- [ ] Red flag detection (inconsistencies, title inflation, timeline gaps)
- [ ] Auto-reject bottom 30-40%, fast-track top 20%

### 2.2 Layer 2 — AI-Generated Skills Assessment
- [ ] Build assessment engine: Claude generates role-specific scenario questions
- [ ] Create question banks for launch verticals:
  - **Accounting & Finance:** trial balance errors, GAAP/IFRS reporting scenarios, QuickBooks/Xero/NetSuite proficiency, month-end close procedures, financial analysis, tax compliance
  - **E-commerce Operations:** inventory strategy, PPC optimization, seller account management, fulfillment logistics, Shopify/Amazon ops, supply chain decisions
- [ ] AI scoring rubric: depth of knowledge, decision-making, strategic thinking, experience signals
- [ ] Candidate-facing assessment UI (Next.js form, timed, 30-45 min)
- [ ] **Future question banks (month 6+):** Healthcare admin, digital marketing — only build when vertical launches

### 2.3 Layer 3 — Video Interview Analysis
- [ ] Candidate records 10-15 min video answering 3-4 structured questions
- [ ] Speech-to-text via Whisper/Deepgram
- [ ] Claude analyzes transcript: communication clarity, structure, confidence, consistency with written assessment
- [ ] AI flags for human review, does not auto-reject at this layer

### 2.4 Layer 4 — Reference Verification
- [ ] AI generates tailored reference check questions based on candidate claims
- [ ] Automated outreach to references (email with structured questionnaire)
- [ ] Cross-reference responses against candidate's stated experience
- [ ] Flag discrepancies for manual review

### 2.5 Composite Scoring & Profile Generation
- [ ] Aggregate scores across all layers into candidate profile
- [ ] Dimensions: domain expertise, communication, leadership, reliability, verification status
- [ ] Generate AI-written candidate summary for employer-facing profile
- [ ] Badge system: "AI-Vetted" / "References Verified" / "Video Verified"

---

## Phase 3: Supply Building (Weeks 4-8, parallel with Phase 2)

### 3.1 Candidate Recruitment (Two-Vertical Focus)
- [ ] **Accounting & Finance outreach:**
  - LinkedIn: SGV/EY PH, KPMG Manila, Deloitte PH, PwC PH alumni
  - Philippine Institute of CPAs (PICPA) networks
  - Wells Fargo Manila, JPMorgan Manila finance teams
  - Target: 15 vetted senior accountants/finance professionals
- [ ] **E-commerce Operations outreach:**
  - LinkedIn: Accenture PH, Concentrix, Teleperformance, Telstra alumni
  - E-commerce BPO teams (Shopify support orgs, Amazon seller services)
  - Target: 15 vetted senior operations managers
- [ ] Referral incentive: vetted candidates who refer other senior professionals in same vertical
- [ ] Target: 30 fully vetted profiles live by end of Phase 3 (15 accounting + 15 ops)

### 3.2 Candidate Experience
- [ ] Application-reviewed model ("We accept 15% of applicants")
- [ ] Professional onboarding flow — not a job board signup
- [ ] Candidate dashboard: see their vetting progress, scores, profile views
- [ ] Feedback loop: candidates get improvement suggestions even if not accepted

---

## Phase 4: Demand & First Placements (Weeks 6-10)

### 4.1 Beta Clients
- [ ] Find 5 companies willing to hire through the platform
- [ ] Offer concierge matching for free/discounted during beta
- [ ] Target: 3 successful placements with testimonials from both sides
- [ ] Document what worked, what didn't, iterate on vetting pipeline

### 4.2 Pricing Validation
- [ ] Test unlock pricing ($25-50 per profile unlock)
- [ ] Test concierge tier ($500-1,000 per curated search)
- [ ] Wire Stripe for credit purchases and concierge payments
- [ ] Validate willingness to pay at senior talent price points

### 4.3 Go-to-Market
- [ ] SEO: target long-tail keywords ("hire senior Filipino accountant", "Filipino operations manager")
- [ ] Content: case studies from beta placements
- [ ] LinkedIn presence targeting US/AU/UK hiring managers
- [ ] Referral program for employers (refer another company, get free unlocks)

---

## Phase 5: Database & Infrastructure (Weeks 8-12)

### 5.1 Backend
- [ ] Set up Supabase (or Postgres)
- [ ] Tables: candidates, employers, unlocks, credits, assessments, vetting_scores
- [ ] Move from mock data to real candidate database
- [ ] API routes for vetting pipeline, matching, unlocks

### 5.2 Deployment (GCP)
- [ ] Deploy to Google Cloud Platform (Cloud Run or App Engine)
- [ ] Cloud SQL (PostgreSQL) for managed database — replaces Neon/Vercel Postgres
- [ ] Cloud Storage for candidate assets (resumes, videos, profile photos)
- [ ] Cloud CDN for static assets and global performance
- [ ] Cloudflare DNS for resourcematch.ph (or new domain if rebranding)
- [ ] CI/CD pipeline via Cloud Build or GitHub Actions → Cloud Run
- [ ] Secret Manager for API keys, Stripe secrets, database credentials
- [ ] Cloud Armor for DDoS protection + WAF (security layer)

---

## Key Metrics to Track

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Vetted candidates live | 30 | 50 | 100+ |
| Employer accounts | 10 | 50 | 150+ |
| Successful placements | 3 | 15 | 50+ |
| Revenue | $1,000 | $5,000/mo | $20,000/mo |
| Candidate acceptance rate | 15-20% | 15-20% | 15-20% |
| Employer satisfaction (NPS) | 8+ | 8+ | 8+ |
| YouTube subscribers | 200 | 2,000 | 5,000-10,000 |
| Newsletter subscribers | 150 | 1,000 | 3,000+ |
| Content pieces (cumulative) | 24 videos | 72 videos | 150+ videos |

---

## What Changes From Current Codebase

| Current | New |
|---------|-----|
| "Thinking Workers" messaging | "Senior Vetted Talent" messaging |
| VA/entry-level positioning | Mid-senior (5-10yr) positioning |
| Credits at $2/unlock | Credits at $25/unlock |
| 4 generic verticals | 2 focused verticals: Accounting & Finance + E-commerce Operations |
| Generic candidate profiles | Portfolio-style verified profiles with vetting scores |
| Client-side mock matching | AI vetting pipeline + real DB |
| 12 mock candidates | 30+ real vetted professionals (15 accounting + 15 ops) |
| No backend | Neon Postgres + Prisma + NextAuth + Claude API |

---

## Immediate Next Steps (This Week)

1. **Decide on name** — keep ResourceMatch or rebrand?
2. **Rewrite landing page copy** — senior talent positioning (two verticals: accounting + operations)
3. **Build Layer 2 assessment prototype** — accounting vertical first (trial balance, reporting, software proficiency scenarios), then e-commerce ops
4. **Start LinkedIn outreach** — identify 25 senior Filipino CPAs from Big 4 PH + 25 senior ops managers from BPO alumni

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Can't attract senior candidates to unknown platform | Personal outreach, professional UX, confidential mode, "invite-only" framing |
| AI vetting isn't accurate enough | Human review layer on top, iterate rubrics with real data, start manual |
| Employers won't pay $25-50/unlock | Test pricing early, concierge tier as alternative, compare to recruiter fees |
| Small candidate pool limits growth | Referral incentives, niche down to 2 verticals first, quality over quantity |
| Existing competitors copy the model | First-mover on senior PH talent + AI vetting combo, network effects from candidate referrals |

---

## Market Projection

### Addressable Market

Philippine outsourcing is a $32B+ industry with 1.7M workers. Most platforms (OnlineJobs.ph, VirtualStaff.ph) serve the VA/entry-level segment ($5-15/hr). Almost nobody curates **senior Filipino professionals** (5-10yr+, $25-50/hr) as a distinct category.

- ~200K companies on OnlineJobs.ph alone, many dissatisfied with quality
- "Hire Filipino" keyword cluster: 50K+ monthly searches
- Vertical long-tail ("hire Filipino accountant", "Filipino operations manager"): low competition, high intent
- Realistic TAM for senior segment: **$50-100M/year** across platforms
- Year 1 serviceable market: **$200K-500K** if execution is strong

### Revenue Projections (Conservative)

```
Month 1:   $0
Month 2:   $200
Month 3:   $1,000
Month 4:   $2,000
Month 5:   $3,500
Month 6:   $5,000
Month 7:   $7,000
Month 8:   $10,000
Month 9:   $12,000
Month 10:  $15,000
Month 11:  $18,000
Month 12:  $20,000+
```

### Revenue Streams at $20K/mo (Month 12) — Two Verticals Only

| Stream | Accounting | Operations | Total |
|--------|-----------|------------|-------|
| Unlocks ($25 each) | 200/mo | 150/mo | $8,750 |
| Concierge ($750-1,000) | 5/mo | 3/mo | $6,500 |
| Subscriptions ($149-299) | 10 firms | 5 companies | $3,000 |
| **Subtotal** | **$11,500** | **$6,750** | **$18,250** |

Add background checks + EOR placements → past $20K. No third or fourth vertical needed.

### Why Two Verticals Beats Four

1. **Vetting pipeline focus** — 2 question banks to build and refine vs 4 mediocre ones
2. **Content authority** — 100 videos about Filipino accountants + ops managers = YouTube category ownership. Spread across 4 = generic
3. **Candidate recruiting** — 2 networks to penetrate (Big 4 PH alumni + BPO alumni), not 4
4. **Employer trust** — 30 vetted CPAs is compelling. 8 CPAs + 8 ops + 7 marketers + 7 healthcare = thin
5. **Expansion rule** — add healthcare admin at month 6+ only if employers are requesting it

### Why the Pivot is Stronger Than "Thinking Workers"

- "AI-augmented vs AI employees" was positioning against small competitors (Staffy, HireAI) that may not survive. If they die, the differentiator dies.
- "Senior vetted talent" addresses a **permanent pain point**: employers waste 10-20 hours screening on OnlineJobs.ph and still get burned.
- At $25-50/unlock, still 50-90% cheaper than a traditional recruiter (15-25% of annual salary = $3K-$8K+ per senior placement).

### Three Things That Make or Break It

1. **Content consistency** — 2 videos/week for 12 months = 100+ videos. Most quit at video 15. The ones who don't own the category.
2. **First 10 placements** — Everything before that is theory. Concierge those first 10 personally.
3. **Candidate quality** — If vetted candidates are genuinely better than OnlineJobs.ph, word of mouth does the work. If not, no marketing saves it.

---

## 12-Month Timeline

### Months 1-2: Foundation + First Supply

**Product:** Landing page live with senior talent positioning. Manual vetting via Google Forms + Claude API. Stripe wired for $25/unlock. 5-10 candidate profiles live.

**Supply:** LinkedIn outreach to 100 senior Filipino professionals — 50 from Big 4/finance firms (accounting), 50 from BPO alumni networks (operations). Target: 20 applications → 10 pass vetting → 5-8 profiles live. Accounting & Finance + E-commerce Operations only.

**Content (8 videos, 2/week):**
- "Why senior Filipino professionals are underpriced"
- "I vetted 50 Filipino professionals with AI — here's what I found"
- "How to hire a Filipino operations manager (not a VA)"
- "OnlineJobs.ph vs hiring senior talent — what nobody tells you"
- "$15/hr Filipino accountant vs $60/hr US accountant — real comparison"
- Behind-the-scenes: building the vetting pipeline
- Interview snippets with vetted candidates
- "What I learned hiring in the Philippines"
- Start newsletter (Beehiiv/ConvertKit), LinkedIn posts 3x/week

**Revenue:** $0-500

**Success metric:** 8 vetted profiles live, 50 newsletter subscribers, 1 paying customer.

### Month 3: First Real Customers

**Product:** Backend MVP live (database, auth, real unlock flow). AI vetting Layer 1 automated. Layer 2 built for accounting & finance + e-commerce operations. 15-20 candidate profiles live.

**Supply:** Second wave LinkedIn outreach. First candidate referrals. Deepen both verticals (don't add new ones yet). Target: 20 total vetted profiles (10 accounting + 10 ops).

**Content (8 videos, 2/week):**
- Case study from first placement
- "I built an AI that vets job candidates — here's how it works"
- Vertical-specific hiring guides
- Compare platform to alternatives
- Answer common objections
- Candidate spotlight: day-in-the-life
- Newsletter at 150+ subscribers, first blog posts for SEO

**Revenue:** $500-1,500

**Success metric:** 3 employers unlocked profiles. 1 successful placement. First testimonial.

### Months 4-5: Validate and Double Down

**Product:** Concierge matching launches ($500-750/search). Video interview layer (Layer 3). Saved searches + email alerts. 25-30 vetted profiles.

**Supply:** Pipeline partially self-sustaining (referrals + inbound from PICPA/BPO networks). Acceptance rate ~15-20%. Target: 30 vetted profiles by end of month 5 (15 accounting + 15 ops). Evaluate adding healthcare admin only if employers are requesting it.

**Content (16 videos over 2 months):**
- 2-3 placement case studies (employer + candidate perspective)
- "We reject 80% of applicants — here's why"
- "How our AI scores candidates" (transparency builds trust)
- Industry deep-dives per vertical
- Guest content: employer and candidate interviews
- Newsletter at 500+. SEO starting to rank long-tail.

**Revenue:** $2,000-4,000/mo

**Success metric:** 5 successful placements, 2 concierge clients, first organic employer signup.

### Months 6-7: Systems + Scale

**Product:** Reference verification (Layer 4) automated. Full vetting pipeline end-to-end with human review on final approval. Subscription tiers launch ($149/mo and $299/mo). Employer dashboard. 40-50 vetted profiles.

**Supply:** Hire part-time recruiter/sourcer ($500-800/mo). Open applications on site. Target: 50 vetted profiles by end of month 7.

**Content (shift to 3 videos/week):**
- Hire Filipino video editor from own platform (great case study)
- Launch "Hiring in the Philippines" podcast
- Vertical landing pages for SEO
- Employer guides, salary guides
- Newsletter at 1,000+

**Revenue:** $5,000-8,000/mo

**Success metric:** 15 total placements, organic traffic driving 30%+ of signups, first subscription customer.

### Months 8-9: Recurring Revenue Layer

**Product:** White-label EOR layer via Philippine partner (see EOR section below). Background check add-on ($15-25/check). API for enterprise clients. 60-75 vetted profiles.

**Supply:** Candidate pipeline self-sustaining. Inbound applications from content reputation. Introduce "featured profiles" ($10-20/mo worker-side monetization).

**Content:**
- YouTube at 2,000-5,000 subscribers
- Start running ads on top-performing videos ($500-1,000/mo budget)
- Webinar series: "How to build a senior remote team in the Philippines"

**Revenue:** $10,000-15,000/mo (unlocks $4-6K + concierge $3-4K + subscriptions $1-2K + EOR $2-4.5K)

**Success metric:** 30+ placements total, 10+ active EOR placements generating recurring revenue.

### Months 10-12: Hit $20K/mo

**Product:** Platform mature. Concierge tier refined ($1,000/guaranteed shortlist). Enterprise tier. Consider second country. 100+ vetted profiles.

**Supply:** Waiting list for vetting slots. "ResourceMatch-vetted" means something in the market. NPS 8+ both sides.

**Content:**
- YouTube at 5,000-10,000 subscribers
- Newsletter at 3,000+
- Ranking for 20+ "hire Filipino [role]" keywords
- Paid ads at $2-3K/mo with positive ROAS
- Annual "State of Filipino Remote Talent" report

**Revenue: $18,000-25,000/mo**

| Stream | Monthly |
|--------|---------|
| Unlocks (250/mo at $35 avg) | $8,750 |
| Concierge (8/mo at $1,000) | $8,000 |
| Subscriptions (15 active) | $2,500 |
| EOR margin (25 placements at $300) | $7,500 |
| Background checks + featured | $750 |
| **Total** | **$27,500** |

Even hitting 60-70% of those numbers gets past $20K.

---

## EOR Strategy

### Decision: EOR is NOT required to hit $20K/mo

$20K/mo is achievable with unlocks + concierge + subscriptions alone. EOR is a **Phase 2 revenue accelerator** (months 8-9+), not a prerequisite.

### Recommended Approach: White-Label EOR Partner

**Phase 1 (Months 8-9):** Partner with a Philippine-based EOR provider. They legally employ the workers, handle payroll, SSS, PhilHealth, Pag-IBIG, 13th month pay, and all DOLE compliance. You own the client relationship and keep the margin.

**Top candidates to contact:**
1. **Davao Accountants** — Local PH firm, built for platforms like ours, likely cheapest
2. **Playroll** — API-first, designed for platform embedding
3. **Deel** — Largest scale, white-label + API available

**Margin model:** Charge client salary + 20-30% markup. Pay EOR partner $190-400/employee/mo. Keep the difference (~$300/mo per placement at senior salary levels).

**Phase 2 (Year 2, 50+ workers):** Consider own Philippine entity with a Filipino co-founder (keeps foreign ownership ≤40%, avoids $200K capital requirement). Register with DOLE, BIR, SSS, PhilHealth, Pag-IBIG.

**Phase 3 (Scale):** Own full EOR with in-house payroll and compliance.

### What NOT to Do

- **Never classify workers as independent contractors.** Philippine labor law heavily favors workers. Misclassification penalties: back wages, forced reclassification, up to PHP 500K per violation.
- **Don't build EOR infrastructure before you have placements asking for it.** Wait until employers say "can you handle payroll too?"
- **Don't register a Philippine entity until you have 30+ active workers.** The compliance burden isn't worth it below that scale.

### Key Philippine Compliance (for reference)

| Contribution | Rate | Split |
|---|---|---|
| SSS | 15% of salary | 10% employer / 5% employee |
| PhilHealth | 5% of salary | 2.5% / 2.5% |
| Pag-IBIG | 4% of salary | 2% / 2% |
| 13th Month Pay | 1/12 of annual salary | Employer only, due by Dec 24 |

---

## Brand Identity

### Official Brand Assets

Location: `/ResourceMatch Logo FIles_ 09-05-2023/`

| Element | Value |
|---------|-------|
| Logo | "BB" icon (golden ratio, R + m + match conceptualization) |
| Primary Color | Evening Sea `#04443C` |
| Accent Color | Raw Sienna `#D38B53` |
| Secondary | Lochinvar `#399A8B` |
| Light | Iceberg `#DBF3EB` |
| Main Font | Montserrat SemiBold |
| Sub Font | Karla Regular |

### Logo Variants Available
- Logo Icon (5 color variants: Evening Sea, Raw Sienna, Lochinvar, White, Iceberg)
- Logo Icon Enclosed
- Logo Type
- Horizontal Logo (5 variants)
- Horizontal Enclosed Logo
- Stacked Logo (5 variants)
- Stacked Enclosed Logo
- Formats: SVG, PNG, PDF for all variants

### Note: Codebase Alignment Needed
Current codebase uses Bricolage Grotesque + `#2D5F3F` / `#D97642`. Brand guidelines specify Montserrat + Karla + `#04443C` / `#D38B53`. Alignment decision pending.
