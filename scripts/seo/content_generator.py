"""Content generator — Claude writes full SEO-optimized blog posts for resourcematch.ph."""

import json
import logging

import anthropic

from scripts.seo.config import _get_secret
from scripts.seo.state import get_state

logger = logging.getLogger(__name__)

RESOURCEMATCH_CONTEXT = """ResourceMatch is a B2B marketplace connecting international companies
with AI-vetted senior Filipino professionals (5-10+ years experience). Based at resourcematch.ph.
Verticals: Finance & Accounting, Operations Management. Key features: 4-layer AI vetting pipeline
(Resume Analysis, Scenario Assessment, Video Interview, Reference Verification), portfolio-style
profiles with case studies and vetting scores, pay-per-unlock pricing ($25/profile), and subscription
plans (Starter $149/mo, Growth $299/mo, Enterprise $599/mo). Target audience: Companies in the US,
UK, Europe, and Australia looking to hire senior-level remote Filipino professionals for accounting,
bookkeeping, financial operations, e-commerce operations, Amazon/Shopify management, inventory/fulfillment.
The platform is NOT a job board or general freelancer marketplace — it's a curated, AI-vetted talent
pool of senior specialists.
CTA: Browse vetted professionals at resourcematch.ph/dashboard or sign up at resourcematch.ph/signup."""

BRAND_VOICE = """RESOURCEMATCH BRAND VOICE & GUIDELINES:
- Tagline: "Hire Senior Filipino Professionals, Vetted by AI"
- Core values: Quality over quantity, transparency in vetting, data-driven matching, long-term placements
- Tone: Authoritative but approachable. Professional but not corporate. Expert in Filipino talent
  and outsourcing, with genuine respect for the professionals on the platform.
- DO NOT sound like a generic staffing agency. Sound like a knowledgeable partner who understands
  both the hiring company's challenges AND the Filipino talent market deeply.
- Think "trusted advisor who has placed hundreds of senior professionals" — direct, specific, credible.
- Primary CTA: "Browse Vetted Professionals" (link to /dashboard)
- Secondary CTA: "Sign Up Free" (link to /signup)
- Always emphasize: senior-only (5-10+ years), AI-vetted (4-layer pipeline), specialized verticals.
- Reference real outsourcing scenarios — specific roles, salary ranges, productivity comparisons,
  time zone strategies, compliance considerations.
- GEOGRAPHIC SENSITIVITY: When writing for a specific market, use that market's currency (GBP, EUR,
  AUD, USD), regulatory references (HMRC, ATO, GDPR, IRS), and compliance frameworks. For universal
  posts, use USD as primary with brief GBP/EUR/AUD equivalents in parentheses for salary comparisons.
  Reference time zone overlaps relevant to the target market.
- DO NOT: Use "In today's digital landscape", "In the ever-changing world of", "Let's dive in",
  generic SEO filler, or language that diminishes Filipino professionals. No emoji in body text.
- DO NOT use em dashes (—). Use commas, periods, colons, or parentheses instead. Em dashes are
  a strong AI writing tell and make content look machine-generated.
- CTAs should link to platform pages: /dashboard, /signup, /hire, /apply — never external URLs.
- Internal linking: Reference other blog posts and platform pages (jobs, pricing) naturally."""


MARKET_CONTEXTS = {
    "us": """TARGET MARKET: United States
- Currency: USD
- Regulatory: US GAAP, IRS (1099/W-9 for contractors), SOX compliance, SEC reporting
- Salary benchmarks: US accountant $75K-$110K/yr, Filipino senior accountant $18K-$36K/yr (USD)
- Time zones: US Eastern/Central/Pacific. Manila morning = US evening (12-16hr difference)
- Common tools: QuickBooks, NetSuite, Sage Intacct, Bill.com
- Compliance notes: 1099 reporting for contractors, W-8BEN for non-US workers, state tax nexus""",

    "uk": """TARGET MARKET: United Kingdom
- Currency: GBP (show GBP primary, USD equivalent in parentheses)
- Regulatory: HMRC, Companies House filings, UK GAAP (FRS 102), Making Tax Digital (MTD), IR35 off-payroll rules, PAYE, National Insurance
- Salary benchmarks: UK accountant 45K-75K GBP/yr, Filipino senior accountant 14K-28K GBP/yr
- Time zones: GMT/BST. Manila is 7-8 hours ahead. Strong overlap during UK morning = Manila afternoon
- Common tools: Xero (dominant in UK), Sage, FreeAgent, QuickBooks UK
- Compliance notes: MTD-compatible software required, VAT returns, Corporation Tax, annual accounts to Companies House, IR35 determination for contractors""",

    "eu": """TARGET MARKET: Europe (EU)
- Currency: EUR (show EUR primary, USD equivalent in parentheses)
- Regulatory: GDPR (data processing for EU client data), IFRS, VAT (intra-EU and reverse charge), local compliance varies (Germany: HGB, France: Plan Comptable, Netherlands: Dutch GAAP)
- Salary benchmarks: EU accountant 40K-70K EUR/yr (varies by country), Filipino senior accountant 16K-32K EUR/yr
- Time zones: CET/CEST. Manila is 6-7 hours ahead. Good overlap during EU morning hours
- Common tools: SAP, Exact Online, Datev (Germany), Xero, local ERP systems
- Compliance notes: GDPR requirements for processing EU personal data offshore, country-specific tax filing, EU invoicing requirements""",

    "au": """TARGET MARKET: Australia
- Currency: AUD (show AUD primary, USD equivalent in parentheses)
- Regulatory: ATO (Australian Taxation Office), ASIC, Fair Work Act, BAS (Business Activity Statement) lodgment, GST, Superannuation (not applicable to offshore contractors), PAYG
- Salary benchmarks: Australian accountant 70K-110K AUD/yr, Filipino senior accountant 28K-56K AUD/yr
- Time zones: AEST is only 2-3 hours ahead of Manila. Near real-time collaboration, best overlap of any market
- Common tools: MYOB, Xero (dominant in AU), QuickBooks AU, Reckon
- Compliance notes: BAS lodgment requirements, PAYG withholding, Taxable Payments Annual Report (TPAR), Single Touch Payroll (STP), GST reporting""",

    "universal": """TARGET MARKET: International (Universal)
- Write for a global audience of English-speaking companies
- Use USD as primary currency with brief GBP/EUR/AUD equivalents for salary comparisons
- Reference compliance considerations generically ("local tax authority", "your jurisdiction's requirements") but mention specific examples from 2-3 markets to add credibility
- Time zone references should cover the range (2-16 hours ahead depending on location)""",
}


def _get_market_context(market):
    """Return market-specific context for the content generation prompt."""
    return MARKET_CONTEXTS.get(market, MARKET_CONTEXTS["universal"])


def _parse_json_response(text):
    """Extract JSON from Claude response, handling markdown fences."""
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


def generate_blog_post(topic_plan):
    """Generate a full blog post.

    Args:
        topic_plan: dict from content_planner with topic, primary_keyword,
                    secondary_keywords, title_suggestion, meta_description, pillar

    Returns:
        dict with title, slug, meta_description, category, tags, keywords,
        reading_time, content, internal_links, related_posts
    """
    api_key = _get_secret("anthropic-api-key")
    client = anthropic.Anthropic(api_key=api_key, max_retries=5)

    state = get_state()
    existing_posts = state.get("blog_posts", [])
    internal_link_targets = [
        {"slug": p["slug"], "title": p["title"], "keywords": p.get("keywords", [])}
        for p in existing_posts[-20:]
    ]

    target_market = topic_plan.get("target_market", "universal")
    market_context = _get_market_context(target_market)

    prompt = f"""Write a complete, publication-ready blog post for resourcematch.ph.

BUSINESS CONTEXT:
{RESOURCEMATCH_CONTEXT}

{BRAND_VOICE}

ARTICLE ASSIGNMENT:
- Topic: {topic_plan['topic']}
- Primary keyword: {topic_plan['primary_keyword']}
- Secondary keywords: {', '.join(topic_plan.get('secondary_keywords', []))}
- Search intent: {topic_plan.get('search_intent', 'informational')}
- Content pillar: {topic_plan.get('pillar', '')}
- Target market: {target_market}
- Title: {topic_plan['title_suggestion']}
- Meta description: {topic_plan['meta_description']}

GEOGRAPHIC CONTEXT:
{market_context}

EXISTING PAGES (for internal linking — link to 2-3 of these where natural):
{json.dumps(internal_link_targets, indent=2) if internal_link_targets else 'No existing blog posts yet. Link to platform pages: /dashboard, /hire, /signup, /apply, /jobs'}

PLATFORM PAGES AVAILABLE FOR LINKING:
- /dashboard — Browse vetted professionals (main CTA target)
- /hire — Pricing plans and credit packs
- /signup — Free account registration
- /apply — Professionals can apply to join the platform
- /jobs — Browse and post job listings

SEO WRITING RULES:
1. TITLE: Use the suggested title or improve it. Under 60 characters. Primary keyword near the front.
2. H1: One H1 only (the title). Natural, not keyword-stuffed.
3. STRUCTURE: Use H2 and H3 headings. Include primary keyword in first H2. Every H2 should be scannable and informative.
4. INTRO (first 100 words): State the problem clearly. Include primary keyword in the first paragraph. Hook with a specific insight or data point — no generic openings.
5. BODY (800-1200 words): Keep it concise and scannable. Genuinely useful, specific advice. Use examples from real outsourcing scenarios. Include data points, benchmarks, or specific numbers. Write for decision-makers, not beginners. Short paragraphs (2-3 sentences). Cut filler ruthlessly.
6. E-E-A-T SIGNALS: Write from the perspective of experienced outsourcing practitioners. Reference specific hiring scenarios, salary benchmarks, and real challenges.
7. KEYWORD USAGE: Primary keyword in title, first paragraph, one H2, meta description, and naturally 3-5 more times. Secondary keywords scattered naturally. Never force a keyword.
8. INTERNAL LINKS: Link to 2-3 existing blog posts using descriptive anchor text. Always link to at least one platform page (/dashboard or /hire).
9. CTAs: Mid-article CTA (subtle, contextual) and end-of-article CTA (direct). Both point to browsing professionals or signing up.
10. FORMATTING: Bullet points for lists, bold for key terms, short paragraphs (3-4 sentences max). Include a key takeaway section.
11. TONE: Professional but not corporate. Direct, knowledgeable, slightly opinionated. Like a senior outsourcing consultant explaining to a smart operations leader. No fluff.
12. DO NOT: Use "In today's digital landscape", "In the ever-changing world of", "Let's dive in", or generic SEO filler. No emoji in the body. NEVER use em dashes (—). Use commas, periods, colons, or parentheses instead.
13. MID-ARTICLE CTA: Place exactly one <CTABanner /> on its own line between the 2nd and 3rd H2 section. Do not wrap it in markdown.
14. GEOGRAPHIC ACCURACY: If this is a market-specific article, use that market's currency as primary throughout. Include the market's regulatory bodies, compliance frameworks, and popular tools. For universal articles, lead with USD and include GBP/EUR/AUD equivalents for any salary or cost comparisons. Never reference regulations from the wrong market (e.g., do not mention IRS in a UK-focused article).
15. HIGH-CONVERTING PATTERNS: For cost comparison articles, always include a side-by-side table with specific numbers. For compliance guides, include a checklist or "what you need to know" summary. For role-specific guides, include a "what to look for" criteria list. These structured elements improve dwell time and conversion.

Return JSON:
{{
  "title": "final article title",
  "slug": "url-friendly-slug",
  "meta_description": "final meta description under 160 chars",
  "category": "{topic_plan.get('pillar', 'outsourcing_strategy')}",
  "target_market": "{target_market}",
  "tags": ["3-5 relevant tags"],
  "keywords": ["{topic_plan['primary_keyword']}", "...secondary keywords"],
  "reading_time": 5,
  "content": "the full article in Markdown (H2s, H3s, bold, links, bullet points)",
  "internal_links": [
    {{"anchor": "anchor text used", "href": "/blog/slug-or-path"}}
  ],
  "related_posts": ["slug1", "slug2"]
}}"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    )

    return _parse_json_response(message.content[0].text)
