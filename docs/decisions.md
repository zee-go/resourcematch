# Decision Log

> Reverse-chronological record of significant decisions. Captures the "why"
> so future sessions don't re-litigate settled questions. Append new entries
> at the top.

## 2026-02-28 — Pivot to AI-vetted senior talent platform

- **Decided**: Reposition ResourceMatch from "Thinking Workers / AI-augmented VAs" to "AI-Vetted Senior Filipino Professionals." Target 5-10+ years experience only. 4-layer AI vetting pipeline. Portfolio-style profiles with vetting scores. $25/unlock pricing (up from $3).
- **Why**: In 2026, "AI-augmented" is table stakes — every remote worker uses AI tools. The original positioning had no defensible moat. Senior talent (5-10yr+) is underserved: OnlineJobs.ph and VirtualStaff.ph are flooded with entry-level profiles. Companies struggle to find and verify senior Filipino professionals. AI vetting creates a quality filter that scales and differentiates from job boards.
- **See**: All `src/components/`, `src/pages/`, `src/lib/candidates.ts`

## 2026-02-28 — Keep ResourceMatch name (not Meridian)

- **Decided**: Keep the name "ResourceMatch" instead of rebranding to "Meridian."
- **Why**: User preference. ResourceMatch clearly communicates the platform's purpose. Avoids domain/branding costs of a rename.
- **See**: All pages reference "ResourceMatch" throughout

## 2026-02-28 — Four industry verticals for launch

- **Decided**: Focus on 4 verticals: E-commerce Operations (primary), Healthcare Admin (primary), Accounting & Finance (secondary), Digital Marketing (secondary).
- **Why**: These verticals have the highest demand for senior Filipino remote professionals. E-commerce and healthcare have clear operational roles that benefit from experienced professionals. Accounting and marketing round out the offering. Vertical specialization enables targeted vetting scenarios and better matching.
- **See**: `src/lib/candidates.ts` (Vertical type), `src/components/dashboard/SearchFilters.tsx`

## 2026-02-28 — New pricing: $25/unlock with higher subscription tiers

- **Decided**: Credit packs: 1/$25, 5/$100, 15/$250. Subscriptions: Starter $149/mo (10 unlocks), Growth $299/mo (25 unlocks), Enterprise $599/mo (unlimited). Up from $3/unlock and $49-249/mo.
- **Why**: Senior talent commands higher pricing. $3/unlock signals low-quality, entry-level talent. $25/unlock reflects the value of AI-vetted, senior professionals with 5-10+ years experience. Higher subscription tiers align with the B2B enterprise buyer persona. Credits never expire to remove purchase anxiety.
- **See**: `src/pages/hire.tsx`, `src/components/UnlockModal.tsx`

## 2026-02-28 — AI vetting pipeline using Claude API

- **Decided**: Build a 4-layer AI vetting pipeline powered by Claude API. Layer 1 (resume analysis) and Layer 2 (scenario assessment) are API routes. Layers 3-4 (video interview, reference check) are metadata/manual for now.
- **Why**: AI vetting is the core differentiator. Claude API provides high-quality, structured analysis. Starting with 2 automated layers keeps scope manageable while demonstrating the concept. Internal admin page allows testing without exposing to public.
- **See**: `src/pages/api/vetting/`, `src/pages/admin/vetting.tsx`, `src/lib/vetting-types.ts`

## 2026-02-28 — Centralized candidate data model

- **Decided**: Create `src/lib/candidates.ts` as single source of truth for all candidate data. All pages import from here instead of duplicating mock data inline.
- **Why**: Original codebase had candidate data duplicated across 4+ files (dashboard, hire, profile, unlocks). Any change required updating multiple files. Centralized model ensures consistency and makes it easy to swap in a real database later.
- **See**: `src/lib/candidates.ts`

## 2026-02-28 — "Thinking Workers" positioning against AI employee platforms

- **Decided**: ~~Position ResourceMatch as the anti-AI-employee platform.~~ **SUPERSEDED** by senior talent pivot (see above).
- **Why**: Original positioning was valid but not defensible in 2026 market.

## 2026-02-28 — Credit economy pricing model

- **Decided**: ~~Hybrid credit + subscription. Credit packs 5/$10, 15/$25, 50/$60.~~ **SUPERSEDED** by new pricing tiers (see above).
- **Why**: Original pricing was too low for senior talent positioning.

## 2026-02-28 — Philippines first, multi-country later

- **Decided**: Focus exclusively on Filipino talent for launch. Keep architecture clean for future expansion (Colombia, India, Ukraine, etc.) but don't over-engineer multi-country support yet.
- **Why**: Philippines is the strongest market for English-speaking remote professionals. Proven demand from US/AU/UK employers. Building for one country first validates the model before scaling. Credit economy model is inherently country-agnostic — same credits work across any talent pool.
- **See**: `CLAUDE.md` (competitors section)

## 2026-02-28 — Softgen AI as codebase starting point

- **Decided**: Export Softgen-generated Next.js app as the foundation. Clean up Softgen artifacts and continue building in Claude Code.
- **Why**: Softgen generated a functional prototype with Next.js 15, shadcn/ui, Tailwind, and basic page structure. Faster than building from scratch. Needs cleanup (turbo rules, element-tagger dev dep) and significant feature additions.
- **See**: `next.config.mjs`, `package.json`

## 2026-02-28 — shadcn/ui New York style with Radix primitives

- **Decided**: Use shadcn/ui with New York variant. Bricolage Grotesque for typography. Forest green primary + burnt sienna accent color palette.
- **Why**: Softgen selected these defaults and they work well for a professional B2B marketplace. New York style is more structured than Default. Color palette communicates trust (green) and energy (sienna).
- **See**: `components.json`, `tailwind.config.ts`, `src/styles/globals.css`

## 2026-02-28 — Client-side AI matching algorithm

- **Decided**: AI matching runs client-side with a 0-100 scoring algorithm: title match (20pts), skills match (40pts), vertical match (25pts), vetting score (15pts). Top matches are candidates scoring 60+.
- **Why**: No backend/database yet. Client-side matching demonstrates the concept and UX. Will move to server-side when database is added. The algorithm weights skills highest because that's what employers care about most. Vertical matching replaced budget matching in the senior talent pivot.
- **See**: `src/pages/dashboard.tsx`

---

## Conventions

- **Date format**: YYYY-MM-DD
- **Entry format**: H2 with date + short title, then bullet points for Decided/Why/See
- **When to log**: Any time you choose between alternatives, change an existing approach, or establish a new convention
- **When NOT to log**: Routine bug fixes, config tweaks, or changes that are self-evident from the code diff
- **Pruning**: Don't delete old entries. This file is append-only. If it gets very long (200+ entries), archive older entries to `docs/decisions-archive.md`
