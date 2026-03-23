"""Topic researcher — Claude-based keyword and topic analysis for resourcematch.ph SEO."""

import json
import logging

import anthropic

from scripts.seo.config import _get_secret
from scripts.seo.state import get_state

logger = logging.getLogger(__name__)

CONTENT_PILLARS = {
    "outsourcing_strategy": {
        "label": "Outsourcing Strategy",
        "description": "Strategic guidance on outsourcing to the Philippines — cost analysis, when to outsource, building remote teams, cultural alignment",
        "seed_keywords": [
            "outsourcing to philippines", "hire filipino professionals",
            "offshore staffing philippines", "remote team philippines",
            "BPO philippines vs in-house",
            "outsource to philippines from uk", "offshore staffing philippines australia",
            "european companies outsourcing philippines",
        ],
    },
    "finance_accounting": {
        "label": "Finance & Accounting",
        "description": "Filipino accounting talent — CPA qualifications, bookkeeping, financial compliance, QuickBooks/Xero/MYOB expertise, US GAAP / UK GAAP / IFRS standards",
        "seed_keywords": [
            "hire filipino accountant", "outsource bookkeeping philippines",
            "filipino CPA", "offshore accounting staff",
            "QuickBooks specialist philippines",
            "outsource bookkeeping uk philippines", "filipino accountant australian business",
            "HMRC compliance outsource", "BAS lodgment outsource philippines",
            "IFRS accounting outsource philippines", "Xero bookkeeper philippines",
        ],
    },
    "operations_management": {
        "label": "Operations Management",
        "description": "E-commerce operations, supply chain, inventory management, Amazon/Shopify specialists, fulfillment coordination, logistics",
        "seed_keywords": [
            "hire filipino operations manager", "e-commerce operations outsourcing",
            "amazon operations specialist philippines", "shopify operations",
            "supply chain management outsourcing",
            "ecommerce operations outsourcing uk", "amazon operations australia outsource",
            "shopify operations philippines europe",
        ],
    },
    "hiring_best_practices": {
        "label": "Hiring Best Practices",
        "description": "How to evaluate, vet, onboard, and manage remote Filipino professionals — interviews, skill testing, time zones, contracts, compliance",
        "seed_keywords": [
            "how to hire in philippines", "vetting remote workers",
            "onboarding offshore staff", "managing remote team philippines",
            "philippine employment law contractors",
            "hire in philippines from uk", "IR35 outsourcing philippines",
            "Fair Work Act offshore contractors", "GDPR offshore hiring",
        ],
    },
    "industry_insights": {
        "label": "Industry Insights",
        "description": "Philippine talent market trends, salary benchmarks, skill availability, BPO industry data, AI impact on outsourcing",
        "seed_keywords": [
            "philippines talent market 2026", "filipino salary benchmarks",
            "BPO industry trends", "AI outsourcing", "remote work philippines",
            "outsourcing philippines from europe", "GBP PHP salary comparison",
            "australia outsourcing trends philippines",
        ],
    },
}

GEOGRAPHIC_MARKETS = {
    "us": {
        "label": "United States",
        "currency": "USD",
        "regulatory": "US GAAP, IRS, 1099/W-9, SOX",
        "keyword_modifiers": ["us", "american", "usa"],
    },
    "uk": {
        "label": "United Kingdom",
        "currency": "GBP",
        "regulatory": "HMRC, Companies House, FRS 102, Making Tax Digital, IR35",
        "keyword_modifiers": ["uk", "british"],
    },
    "eu": {
        "label": "Europe",
        "currency": "EUR",
        "regulatory": "GDPR, IFRS, VAT, local compliance varies by country",
        "keyword_modifiers": ["europe", "european", "eu"],
    },
    "au": {
        "label": "Australia",
        "currency": "AUD",
        "regulatory": "ATO, ASIC, Fair Work Act, BAS, GST, MYOB/Xero",
        "keyword_modifiers": ["australia", "australian"],
    },
}


def research_topics(count=5):
    """Use Claude to generate topic ideas with keyword targets.

    Args:
        count: number of topic ideas to generate

    Returns:
        list of dicts with topic, page_type, primary_keyword, secondary_keywords,
        search_intent, pillar, title_suggestion, meta_description, rationale
    """
    api_key = _get_secret("anthropic-api-key")
    client = anthropic.Anthropic(api_key=api_key, max_retries=5)

    state = get_state()
    existing_keywords = list(state.get("keyword_coverage", {}).keys())
    existing_titles = [p["title"] for p in state.get("blog_posts", [])]
    existing_titles += [p["title"] for p in state.get("landing_pages", [])]

    pillars_context = "\n".join(
        f"- {k}: {v['label']} — {v['description']} (seeds: {', '.join(v['seed_keywords'][:3])})"
        for k, v in CONTENT_PILLARS.items()
    )

    markets_context = "\n".join(
        f"- {v['label']} ({v['currency']}): {v['regulatory']}"
        for v in GEOGRAPHIC_MARKETS.values()
    )

    prompt = f"""You are an SEO strategist for ResourceMatch (resourcematch.ph), an AI-vetted senior Filipino talent platform.

BUSINESS CONTEXT:
- ResourceMatch is a B2B marketplace connecting international companies with AI-vetted senior Filipino professionals
- Professionals have 5-10+ years experience in Finance & Accounting or Operations Management
- 4-layer AI vetting pipeline: Resume Analysis, Scenario Assessment, Video Interview, Reference Verification
- Target audience: Companies in the US, UK, Europe, and Australia considering outsourcing to the Philippines for senior professional roles
- Pricing: Pay-per-unlock ($25/profile), subscription plans ($149-$599/mo)
- Goal: Rank on Google for Philippine outsourcing + vertical-specific hiring terms across all 4 markets → organic traffic → signups → profile unlocks

GEOGRAPHIC MARKETS:
{markets_context}

CONTENT PILLARS:
{pillars_context}

ALREADY PUBLISHED (do NOT repeat these topics):
{json.dumps(existing_titles[:30], indent=2) if existing_titles else "Nothing yet — this is week 1."}

ALREADY TARGETED KEYWORDS:
{', '.join(existing_keywords[:50]) if existing_keywords else "None yet."}

Generate exactly {count} content ideas:
- At least 2 should be blog posts (page_type: "blog") — informational, 800-1200 words
- At least 2 should be landing pages (page_type: "landing") — commercial intent, 600-900 words

BLOG POSTS target informational search intent — "how to hire", "guide to outsourcing", "best practices", "cost of", "vs" comparisons, "top skills", "checklist".

LANDING PAGES target commercial/transactional search intent — "hire filipino accountant", "outsource bookkeeping philippines", "filipino operations manager". These are conversion-focused pages that sell ResourceMatch's value for a specific role, vertical, or use case. They should target keywords where someone is ready to take action.

GEOGRAPHIC TARGETING:
- Generate a MIX of universal topics (applicable to all markets) AND region-specific topics (targeting one market's compliance, salary norms, or regulations)
- For region-specific topics, include the target market name in the primary_keyword and title (e.g. "outsource bookkeeping philippines uk", "hire filipino accountant australia")
- Ensure geographic diversity: do NOT generate all topics for the same market
- High-converting content types to consider:
  - COST COMPARISONS: "Filipino Accountant vs [Market] Accountant: Full Cost Breakdown" (one per market)
  - COMPLIANCE GUIDES: "Hiring Filipino Professionals from [Market]: Compliance Checklist"
  - TOOL-SPECIFIC: "Outsourcing [Xero/MYOB/Sage] Bookkeeping to the Philippines"
  - TIME ZONE GUIDES: "Working with Filipino Teams from [Market]: Time Zone Strategies"

Prioritize topics where:
1. ResourceMatch has genuine expertise (E-E-A-T) — Philippine talent market, vetting, outsourcing
2. The keyword has clear commercial intent for companies considering Filipino hires
3. Competition is beatable (long-tail > head terms for a new blog)
4. The topic supports a cluster strategy (connects to a pillar)
5. The Philippine/outsourcing angle is a differentiator

Return JSON array:
[
  {{
    "topic": "descriptive topic name",
    "page_type": "blog",
    "primary_keyword": "the exact keyword phrase to target",
    "secondary_keywords": ["2-4 related keywords"],
    "search_intent": "informational",
    "pillar": "pillar key from the list above",
    "target_market": "us | uk | eu | au | universal",
    "title_suggestion": "SEO-optimized page title (under 60 chars)",
    "meta_description": "compelling meta description (under 160 chars)",
    "rationale": "why this topic is worth writing now — 1-2 sentences"
  }}
]"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    return json.loads(text.strip())
