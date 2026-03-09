"""Signal scanner — finds warm leads from job boards.

Scrapes OnlineJobs.ph, Remotive, and RemoteOK for companies actively hiring
Filipino accounting/finance or operations talent. These are the warmest leads
because they already buy what ResourceMatch sells.
"""

import logging
import re
from urllib.parse import quote_plus

import requests

logger = logging.getLogger(__name__)

# Keywords that indicate relevant job postings
ACCOUNTING_KEYWORDS = [
    "accountant", "bookkeeper", "accounting", "QuickBooks", "Xero",
    "financial analyst", "controller", "accounts payable", "accounts receivable",
    "payroll", "tax preparation", "CPA", "financial reporting",
]

OPS_KEYWORDS = [
    "operations", "e-commerce", "ecommerce", "amazon seller",
    "shopify", "inventory", "fulfillment", "logistics",
    "supply chain", "procurement", "order management",
    "virtual assistant", "executive assistant",
]

ALL_KEYWORDS = ACCOUNTING_KEYWORDS + OPS_KEYWORDS


def _classify_vertical(text):
    """Classify a job posting into a ResourceMatch vertical."""
    text_lower = text.lower()
    acct_score = sum(1 for kw in ACCOUNTING_KEYWORDS if kw.lower() in text_lower)
    ops_score = sum(1 for kw in OPS_KEYWORDS if kw.lower() in text_lower)
    if acct_score > ops_score:
        return "accounting"
    elif ops_score > acct_score:
        return "ecommerce"
    return None


def _extract_company_email(website_url):
    """Try to extract a contact email from a company website."""
    if not website_url:
        return None
    try:
        resp = requests.get(website_url, timeout=10, headers={
            "User-Agent": "Mozilla/5.0 (compatible; ResourceMatch/1.0)"
        })
        if resp.ok:
            # Simple email regex extraction from page content
            emails = re.findall(
                r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
                resp.text
            )
            # Filter out common non-contact emails
            skip_patterns = [
                "noreply", "no-reply", "support", "info@", "admin@",
                "webmaster", "abuse@", "postmaster", "mailer-daemon",
                "example.com", "sentry.io", "googleapis.com",
            ]
            for email in emails:
                email_lower = email.lower()
                if not any(pat in email_lower for pat in skip_patterns):
                    return email_lower
    except Exception:
        pass
    return None


def scan_remotive():
    """Scan Remotive API for relevant remote job postings.

    Returns list of company signals (company name, job title, URL, vertical).
    """
    signals = []

    for category in ["finance-legal", "customer-support", "all-others"]:
        try:
            resp = requests.get(
                f"https://remotive.com/api/remote-jobs?category={category}&limit=50",
                timeout=15,
                headers={"User-Agent": "ResourceMatch/1.0"},
            )
            if not resp.ok:
                continue

            jobs = resp.json().get("jobs", [])
            for job in jobs:
                title = job.get("title", "")
                desc = job.get("description", "")
                combined = f"{title} {desc}"
                vertical = _classify_vertical(combined)

                if vertical:
                    signal = {
                        "company_name": job.get("company_name", ""),
                        "company_logo": job.get("company_logo_url"),
                        "job_title": title,
                        "job_url": job.get("url", ""),
                        "vertical": vertical,
                        "source": "remotive",
                        "source_category": category,
                    }
                    signals.append(signal)

        except requests.RequestException as e:
            logger.warning("Remotive scan failed for %s: %s", category, e)

    logger.info("Remotive: found %d relevant signals", len(signals))
    return signals


def scan_remoteok():
    """Scan RemoteOK API for relevant remote job postings."""
    signals = []

    try:
        resp = requests.get(
            "https://remoteok.com/api",
            timeout=15,
            headers={"User-Agent": "ResourceMatch/1.0"},
        )
        if not resp.ok:
            return signals

        jobs = resp.json()
        # First item is metadata, skip it
        for job in jobs[1:]:
            title = job.get("position", "")
            desc = job.get("description", "")
            tags = " ".join(job.get("tags", []))
            combined = f"{title} {desc} {tags}"
            vertical = _classify_vertical(combined)

            if vertical:
                signal = {
                    "company_name": job.get("company", ""),
                    "company_logo": job.get("company_logo"),
                    "job_title": title,
                    "job_url": job.get("url", ""),
                    "vertical": vertical,
                    "source": "remoteok",
                    "source_category": ",".join(job.get("tags", [])),
                }
                signals.append(signal)

    except requests.RequestException as e:
        logger.warning("RemoteOK scan failed: %s", e)

    logger.info("RemoteOK: found %d relevant signals", len(signals))
    return signals


def scan_onlinejobs_ph():
    """Scan OnlineJobs.ph for companies hiring Filipino talent.

    OLJ doesn't have a public API, so we scrape the search results page.
    Returns company signals from job listings.
    """
    signals = []
    search_queries = [
        "accountant", "bookkeeper", "QuickBooks",
        "e-commerce operations", "amazon seller", "shopify",
    ]

    for query in search_queries:
        try:
            resp = requests.get(
                f"https://www.onlinejobs.ph/jobseekers/jobsearch?jobkeyword={quote_plus(query)}",
                timeout=15,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                                  "Chrome/120.0.0.0 Safari/537.36",
                },
            )
            if not resp.ok:
                continue

            # Extract employer names and job titles from search results
            # OLJ uses specific HTML patterns for job cards
            employer_matches = re.findall(
                r'class="employer-name[^"]*"[^>]*>([^<]+)</a>',
                resp.text,
            )
            title_matches = re.findall(
                r'class="job-title[^"]*"[^>]*>([^<]+)</a>',
                resp.text,
            )

            seen_companies = set()
            for i, employer in enumerate(employer_matches):
                employer = employer.strip()
                if employer in seen_companies:
                    continue
                seen_companies.add(employer)

                job_title = title_matches[i].strip() if i < len(title_matches) else query
                vertical = _classify_vertical(f"{job_title} {query}")

                if vertical:
                    signal = {
                        "company_name": employer,
                        "job_title": job_title,
                        "job_url": f"https://www.onlinejobs.ph",
                        "vertical": vertical,
                        "source": "onlinejobs_ph",
                        "source_category": query,
                    }
                    signals.append(signal)

        except requests.RequestException as e:
            logger.warning("OLJ scan failed for '%s': %s", query, e)

    logger.info("OnlineJobs.ph: found %d relevant signals", len(signals))
    return signals


def get_daily_signals():
    """Run all signal scanners and return combined results.

    Deduplicates by company name (case-insensitive).
    """
    all_signals = []
    seen_companies = set()

    # Run scanners (non-blocking — each can fail independently)
    for scanner in [scan_remotive, scan_remoteok, scan_onlinejobs_ph]:
        try:
            signals = scanner()
            for signal in signals:
                company_key = signal["company_name"].lower().strip()
                if company_key and company_key not in seen_companies:
                    seen_companies.add(company_key)
                    all_signals.append(signal)
        except Exception as e:
            logger.warning("Scanner %s failed: %s", scanner.__name__, e)

    logger.info("Total unique company signals: %d", len(all_signals))
    return all_signals
