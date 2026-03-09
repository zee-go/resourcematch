"""Candidate sourcer — find senior Filipino professionals via Apollo + Reddit.

Apollo: searches for Filipino professionals by title/location (free, no credits).
Reddit: scans subreddits via JSON API for job-seeking posts from Filipino professionals.
LinkedIn search URLs: fallback if Apollo API key not configured.
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


def search_apollo_candidates(vertical="accounting", max_results=10):
    """Search Apollo for Filipino professionals matching a vertical.

    Uses /mixed_people/api_search (free — no email credits consumed).
    Returns list of candidate dicts with name, title, company, LinkedIn URL.
    Falls back to empty list if Apollo key not configured.
    """
    try:
        from scripts.outreach.config import get_apollo_api_key
        api_key = get_apollo_api_key()
        if not api_key:
            logger.info("Apollo API key not configured, skipping candidate search.")
            return []
    except Exception:
        logger.info("Apollo API key not available, skipping candidate search.")
        return []

    from scripts.outreach.state import (
        get_candidate_state,
        get_apollo_candidate_page,
        set_apollo_candidate_page,
    )

    titles = CANDIDATE_TITLES.get(vertical, CANDIDATE_TITLES["accounting"])
    page = get_apollo_candidate_page() + 1  # next page

    payload = {
        "api_key": api_key,
        "page": page,
        "per_page": max_results,
        "person_titles": titles,
        "person_locations": ["Philippines"],
        "person_seniorities": ["senior", "manager", "director", "vp"],
    }

    try:
        resp = requests.post(
            f"{APOLLO_API_BASE}/mixed_people/search",
            json=payload,
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as e:
        logger.error("Apollo candidate search failed: %s", e)
        return []

    # Dedup against already-seen LinkedIn URLs
    candidate_state = get_candidate_state()
    seen_urls = set(candidate_state.get("seen_apollo_urls", []))

    candidates = []
    for person in data.get("people", []):
        linkedin_url = person.get("linkedin_url", "")
        if not linkedin_url or linkedin_url in seen_urls:
            continue

        org = person.get("organization", {})
        candidates.append({
            "name": person.get("name", ""),
            "first_name": person.get("first_name", ""),
            "last_name": person.get("last_name", ""),
            "title": person.get("title", ""),
            "linkedin_url": linkedin_url,
            "company": org.get("name", ""),
            "city": person.get("city", ""),
            "country": person.get("country", "Philippines"),
            "source": "apollo",
        })

    # Update pagination — reset to 1 if no results (exhausted pages)
    if candidates:
        set_apollo_candidate_page(page)
    else:
        set_apollo_candidate_page(0)

    logger.info(
        "Apollo candidate search (%s): found %d candidates (page %d)",
        vertical, len(candidates), page,
    )
    return candidates

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
    """Run daily candidate sourcing: Apollo search + Reddit scan.

    Args:
        directive: CEO bot directive dict (optional, guides vertical focus)

    Returns:
        dict with apollo_candidates, linkedin_searches (fallback), and reddit_candidates
    """
    vertical = "accounting"
    if directive:
        vertical = directive.get("primary_vertical", "accounting")

    # Apollo candidate search (free, no credits)
    apollo_candidates = search_apollo_candidates(vertical=vertical, max_results=10)

    # Fallback: LinkedIn search URLs if Apollo returned nothing
    linkedin_searches = []
    if not apollo_candidates:
        linkedin_searches = get_linkedin_search_urls(vertical=vertical, limit=3)

    # Reddit candidate scan
    reddit_candidates = scan_reddit(max_per_sub=15, max_age_days=7)

    logger.info(
        "Daily sourcing: %d Apollo candidates, %d LinkedIn searches, %d Reddit candidates",
        len(apollo_candidates), len(linkedin_searches), len(reddit_candidates),
    )

    return {
        "apollo_candidates": apollo_candidates,
        "linkedin_searches": linkedin_searches,
        "reddit_candidates": reddit_candidates,
    }
