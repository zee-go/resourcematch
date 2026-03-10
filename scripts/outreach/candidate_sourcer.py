"""Candidate sourcer — find senior Filipino professionals via Apollo + Reddit.

Apollo org search (free): finds Philippine companies by vertical, then generates
targeted LinkedIn People Search URLs scoped to each company + job title.
Reddit: scans subreddits via JSON API for job-seeking posts from Filipino professionals.
"""

import json
import logging
import re
from datetime import datetime, timedelta

import requests

logger = logging.getLogger(__name__)

# ─── Apollo Candidate Search ──────────────────────────────────

APOLLO_API_BASE = "https://api.apollo.io/api/v1"

CANDIDATE_TITLES = {
    "accounting": [
        "Accountant", "Senior Accountant", "Staff Accountant",
        "Bookkeeper", "CPA", "Financial Analyst",
        "Auditor", "Controller", "Tax Specialist",
        "Accounting Manager", "Finance Manager",
    ],
    "operations": [
        "Operations Manager", "E-commerce Manager",
        "Supply Chain Manager", "Logistics Manager",
        "Inventory Manager", "Fulfillment Manager",
        "Amazon Specialist", "Shopify Manager",
        "Project Manager", "Virtual Assistant",
    ],
}


VERTICAL_ORG_KEYWORDS = {
    "accounting": ["accounting", "finance", "bookkeeping", "audit", "tax"],
    "operations": ["e-commerce", "logistics", "supply chain", "fulfillment", "operations"],
}


def search_apollo_companies(vertical="accounting", max_results=10):
    """Search Apollo for Philippine companies in a vertical (free endpoint).

    Uses /organizations/search (free on all plans).
    Returns list of company dicts with name, LinkedIn URL, industry, city, size.
    """
    try:
        from scripts.outreach.config import get_apollo_api_key
        api_key = get_apollo_api_key()
        if not api_key:
            logger.info("Apollo API key not configured, skipping org search.")
            return []
    except Exception:
        logger.info("Apollo API key not available, skipping org search.")
        return []

    from scripts.outreach.state import (
        get_apollo_candidate_page,
        set_apollo_candidate_page,
    )

    keywords = VERTICAL_ORG_KEYWORDS.get(vertical, VERTICAL_ORG_KEYWORDS["accounting"])
    page = get_apollo_candidate_page() + 1

    payload = {
        "page": page,
        "per_page": max_results,
        "organization_locations": ["Philippines"],
        "organization_num_employees_ranges": ["11,50", "51,200", "201,500", "501,1000"],
        "q_organization_keyword_tags": keywords,
    }

    headers = {
        "X-Api-Key": api_key,
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(
            f"{APOLLO_API_BASE}/organizations/search",
            json=payload,
            headers=headers,
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as e:
        logger.error("Apollo org search failed: %s", e)
        return []

    # Dedup against already-seen company LinkedIn URLs
    from scripts.outreach.state import get_candidate_state
    candidate_state = get_candidate_state()
    seen_urls = set(candidate_state.get("seen_apollo_urls", []))

    companies = []
    for org in data.get("organizations", []):
        linkedin_url = org.get("linkedin_url", "")
        if linkedin_url in seen_urls:
            continue

        companies.append({
            "name": org.get("name", ""),
            "linkedin_url": linkedin_url,
            "website": org.get("website_url", ""),
            "industry": org.get("industry", ""),
            "city": org.get("city", ""),
            "country": org.get("country", "Philippines"),
            "size": org.get("estimated_num_employees", 0),
            "keywords": org.get("keywords", [])[:5],
        })

    # Update pagination — reset if no results
    if companies:
        set_apollo_candidate_page(page)
    else:
        set_apollo_candidate_page(0)

    logger.info(
        "Apollo org search (%s): found %d companies (page %d)",
        vertical, len(companies), page,
    )
    return companies


def build_targeted_linkedin_searches(companies, vertical="accounting", titles_per_company=2):
    """Build LinkedIn People Search URLs from Apollo company data + job titles.

    For each company, generates LinkedIn search URLs scoped to that company
    with vertical-specific job titles — much more targeted than generic searches.

    Returns list of dicts with company, title, search_url.
    """
    titles = CANDIDATE_TITLES.get(vertical, CANDIDATE_TITLES["accounting"])

    searches = []
    for company in companies:
        company_name = company.get("name", "")
        if not company_name:
            continue

        for title in titles[:titles_per_company]:
            # Avoid "Philippines Philippines" if company name already contains it
            location = "" if "philippines" in company_name.lower() else " Philippines"
            query = f"{title} {company_name}{location}"
            encoded = requests.utils.quote(query)
            searches.append({
                "company": company_name,
                "company_linkedin": company.get("linkedin_url", ""),
                "company_industry": company.get("industry", ""),
                "company_size": company.get("size", 0),
                "company_city": company.get("city", ""),
                "title": title,
                "search_query": query,
                "search_url": f"https://www.linkedin.com/search/results/people/?keywords={encoded}",
                "vertical": vertical,
            })

    logger.info("Built %d targeted LinkedIn searches from %d companies",
                len(searches), len(companies))
    return searches

# ─── LinkedIn Search Queries ────────────────────────────────────

LINKEDIN_SEARCHES = {
    "accounting": [
        "Filipino accountant remote",
        "Filipino bookkeeper QuickBooks",
        "CPA Philippines remote",
        "Filipino financial analyst",
        "Filipino Xero specialist remote",
        "Philippines accounting remote work",
    ],
    "operations": [
        "Filipino operations manager remote",
        "Filipino e-commerce specialist Shopify",
        "Filipino Amazon FBA manager",
        "Filipino inventory manager remote",
        "Philippines supply chain remote",
        "Filipino virtual assistant senior",
    ],
}

# ─── Reddit Communities ─────────────────────────────────────────

REDDIT_SUBREDDITS = [
    "phcareers",
    "buhaydigital",
    "forhire",
    "VirtualAssistants",
    "freelance",
    "accounting",
]

# Keywords indicating a Filipino professional seeking remote work
CANDIDATE_KEYWORDS = [
    "filipino", "philippines", "ph-based", "manila", "cebu", "davao",
    "remote work", "looking for work", "available for hire", "open to opportunities",
    "accountant", "bookkeeper", "cpa", "quickbooks", "xero",
    "operations", "shopify", "amazon", "e-commerce", "ecommerce",
    "virtual assistant", "va", "senior", "experienced",
]

# Keywords that indicate this is NOT a candidate (it's a company posting)
EXCLUDE_KEYWORDS = [
    "hiring", "we're looking", "job opening", "apply now",
    "our team", "join us",
]


def get_linkedin_search_urls(vertical="accounting", limit=3):
    """Generate LinkedIn search URLs for the given vertical.

    Returns list of dicts with search_query and search_url.
    The user will open these URLs manually on LinkedIn.
    """
    queries = LINKEDIN_SEARCHES.get(vertical, LINKEDIN_SEARCHES["accounting"])
    results = []

    for query in queries[:limit]:
        encoded = requests.utils.quote(query)
        results.append({
            "search_query": query,
            "search_url": f"https://www.linkedin.com/search/results/people/?keywords={encoded}",
            "vertical": vertical,
        })

    return results


def scan_reddit(subreddits=None, max_per_sub=10, max_age_days=7):
    """Scan Reddit subreddits for posts from Filipino professionals seeking work.

    Uses Reddit's public JSON API (no auth required, rate-limited).
    Returns list of candidate signal dicts.
    """
    subs = subreddits or REDDIT_SUBREDDITS
    candidates = []
    cutoff = datetime.now() - timedelta(days=max_age_days)

    for sub in subs:
        try:
            posts = _fetch_subreddit_posts(sub, limit=max_per_sub)
            for post in posts:
                if _is_candidate_post(post):
                    candidates.append({
                        "source": "reddit",
                        "subreddit": sub,
                        "title": post.get("title", ""),
                        "author": post.get("author", ""),
                        "url": f"https://reddit.com{post.get('permalink', '')}",
                        "text": post.get("selftext", "")[:500],
                        "created_utc": post.get("created_utc", 0),
                        "score": post.get("score", 0),
                        "vertical": _classify_vertical(post),
                    })
        except Exception as e:
            logger.warning("Reddit scan failed for r/%s: %s", sub, e)

    # Sort by recency
    candidates.sort(key=lambda x: x.get("created_utc", 0), reverse=True)
    logger.info("Reddit scan: found %d candidate signals across %d subreddits",
                len(candidates), len(subs))
    return candidates


def _fetch_subreddit_posts(subreddit, limit=10):
    """Fetch recent posts from a subreddit via public JSON API."""
    url = f"https://www.reddit.com/r/{subreddit}/new.json"
    headers = {"User-Agent": "ResourceMatch-CandidateScout/1.0"}
    resp = requests.get(url, headers=headers, params={"limit": limit}, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    return [child["data"] for child in data.get("data", {}).get("children", [])]


def _is_candidate_post(post):
    """Check if a Reddit post looks like a Filipino professional seeking work."""
    text = f"{post.get('title', '')} {post.get('selftext', '')}".lower()

    # Must match at least one candidate keyword
    has_candidate_signal = any(kw in text for kw in CANDIDATE_KEYWORDS)
    if not has_candidate_signal:
        return False

    # Exclude company job postings
    has_exclude = any(kw in text for kw in EXCLUDE_KEYWORDS)
    if has_exclude:
        return False

    return True


def _classify_vertical(post):
    """Classify a Reddit post into a vertical based on keywords."""
    text = f"{post.get('title', '')} {post.get('selftext', '')}".lower()

    accounting_keywords = ["account", "bookkeep", "cpa", "quickbooks", "xero", "tax", "audit", "financial"]
    ops_keywords = ["operations", "shopify", "amazon", "e-commerce", "ecommerce", "inventory", "logistics", "supply chain"]

    accounting_score = sum(1 for kw in accounting_keywords if kw in text)
    ops_score = sum(1 for kw in ops_keywords if kw in text)

    if accounting_score > ops_score:
        return "accounting"
    elif ops_score > accounting_score:
        return "operations"
    return "general"


def get_daily_candidates(directive=None):
    """Run daily candidate sourcing: Apollo org search → LinkedIn URLs + Reddit scan.

    Args:
        directive: CEO bot directive dict (optional, guides vertical focus)

    Returns:
        dict with targeted_searches (Apollo-powered), linkedin_searches (generic fallback),
        and reddit_candidates
    """
    vertical = "accounting"
    if directive:
        vertical = directive.get("primary_vertical", "accounting")

    # Apollo org search (free) → targeted LinkedIn people search URLs
    targeted_searches = []
    companies = search_apollo_companies(vertical=vertical, max_results=5)
    if companies:
        targeted_searches = build_targeted_linkedin_searches(
            companies, vertical=vertical, titles_per_company=2,
        )

    # Fallback: generic LinkedIn search URLs if Apollo returned nothing
    linkedin_searches = []
    if not targeted_searches:
        linkedin_searches = get_linkedin_search_urls(vertical=vertical, limit=3)

    # Reddit candidate scan
    reddit_candidates = scan_reddit(max_per_sub=15, max_age_days=7)

    logger.info(
        "Daily sourcing: %d targeted searches, %d generic searches, %d Reddit candidates",
        len(targeted_searches), len(linkedin_searches), len(reddit_candidates),
    )

    return {
        "targeted_searches": targeted_searches,
        "linkedin_searches": linkedin_searches,
        "reddit_candidates": reddit_candidates,
    }
