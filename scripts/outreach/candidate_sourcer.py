"""Candidate sourcer — find senior Filipino professionals on LinkedIn + Reddit.

Maya generates search queries and scans Reddit for relevant posts.
LinkedIn: generates search URLs + drafts connection notes (user sends manually).
Reddit: scans subreddits via JSON API for job-seeking posts from Filipino professionals.
"""

import json
import logging
import re
from datetime import datetime, timedelta

import requests

logger = logging.getLogger(__name__)

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
    """Run daily candidate sourcing: LinkedIn searches + Reddit scan.

    Args:
        directive: CEO bot directive dict (optional, guides vertical focus)

    Returns:
        dict with linkedin_searches and reddit_candidates
    """
    vertical = "accounting"
    if directive:
        vertical = directive.get("primary_vertical", "accounting")

    # LinkedIn search URLs (user sends manually)
    linkedin_searches = get_linkedin_search_urls(vertical=vertical, limit=3)

    # Reddit candidate scan
    reddit_candidates = scan_reddit(max_per_sub=15, max_age_days=7)

    logger.info("Daily sourcing: %d LinkedIn searches, %d Reddit candidates",
                len(linkedin_searches), len(reddit_candidates))

    return {
        "linkedin_searches": linkedin_searches,
        "reddit_candidates": reddit_candidates,
    }
