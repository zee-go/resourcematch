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
        ],
    },
    "finance_accounting": {
        "label": "Finance & Accounting",
        "description": "Filipino accounting talent — CPA qualifications, bookkeeping, financial compliance, QuickBooks expertise, US GAAP vs Philippine standards",
        "seed_keywords": [
            "hire filipino accountant", "outsource bookkeeping philippines",
            "filipino CPA", "offshore accounting staff",
            "QuickBooks specialist philippines",
        ],
    },
    "operations_management": {
        "label": "Operations Management",
        "description": "E-commerce operations, supply chain, inventory management, Amazon/Shopify specialists, fulfillment coordination, logistics",
        "seed_keywords": [
            "hire filipino operations manager", "e-commerce operations outsourcing",
            "amazon operations specialist philippines", "shopify operations",
            "supply chain management outsourcing",
        ],
    },
    "hiring_best_practices": {
        "label": "Hiring Best Practices",
        "description": "How to evaluate, vet, onboard, and manage remote Filipino professionals — interviews, skill testing, time zones, contracts, compliance",
        "seed_keywords": [
            "how to hire in philippines", "vetting remote workers",
            "onboarding offshore staff", "managing remote team philippines",
            "philippine employment law contractors",
        ],
    },
    "industry_insights": {
        "label": "Industry Insights",
        "description": "Philippine talent market trends, salary benchmarks, skill availability, BPO industry data, AI impact on outsourcing",
        "seed_keywords": [
            "philippines talent market 2026", "filipino salary benchmarks",
            "BPO industry trends", "AI outsourcing", "remote work philippines",
        ],
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

    pillars_context = "\n".join(
        f"- {k}: {v['label']} — {v['description']} (seeds: {', '.join(v['seed_keywords'][:3])})"
        for k, v in CONTENT_PILLARS.items()
    )

    prompt = f"""You are an SEO strategist for ResourceMatch (resourcematch.ph), an AI-vetted senior Filipino talent platform.

BUSINESS CONTEXT:
- ResourceMatch is a B2B marketplace connecting international companies with AI-vetted senior Filipino professionals
- Professionals have 5-10+ years experience in Finance & Accounting or Operations Management
- 4-layer AI vetting pipeline: Resume Analysis, Scenario Assessment, Video Interview, Reference Verification
- Target audience: US/EU companies considering outsourcing to the Philippines for senior professional roles
- Pricing: Pay-per-unlock ($25/profile), subscription plans ($149-$599/mo)
- Goal: Rank on Google for Philippine outsourcing + vertical-specific hiring terms → organic traffic → signups → profile unlocks

CONTENT PILLARS:
{pillars_context}

ALREADY PUBLISHED (do NOT repeat these topics):
{json.dumps(existing_titles[:30], indent=2) if existing_titles else "Nothing yet — this is week 1."}

ALREADY TARGETED KEYWORDS:
{', '.join(existing_keywords[:50]) if existing_keywords else "None yet."}

Generate exactly {count} blog post ideas (informational, 1500-2500 words).

Target informational search intent — "how to hire", "guide to outsourcing", "best practices", "cost of", "vs" comparisons, "top skills", "checklist".

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
