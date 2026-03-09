"""Lead enrichment — scrapes company websites for context to personalize outreach."""

import logging
import re

import requests

logger = logging.getLogger(__name__)


def enrich_lead(lead):
    """Enrich a lead with company website context.

    Adds:
    - company_description: extracted from website meta/about
    - company_technologies: detected tech stack clues
    - hiring_signals: relevant job posting indicators
    """
    enrichment = {
        "company_description": "",
        "company_technologies": [],
        "hiring_signals": [],
    }

    website = lead.get("company_website", "")
    if not website:
        lead["enrichment"] = enrichment
        return lead

    if not website.startswith("http"):
        website = f"https://{website}"

    # Scrape company homepage for context
    try:
        resp = requests.get(
            website,
            timeout=10,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                              "AppleWebKit/537.36 (KHTML, like Gecko) "
                              "Chrome/120.0.0.0 Safari/537.36",
            },
            allow_redirects=True,
        )
        if resp.ok:
            html = resp.text

            # Extract meta description
            meta_match = re.search(
                r'<meta\s+(?:name|property)=["\'](?:description|og:description)["\']\s+'
                r'content=["\']([^"\']+)["\']',
                html, re.IGNORECASE,
            )
            if meta_match:
                enrichment["company_description"] = meta_match.group(1).strip()

            # Detect technologies
            tech_signals = {
                "Shopify": ["shopify", "myshopify.com"],
                "Amazon": ["amazon seller", "amazon fba", "aws"],
                "QuickBooks": ["quickbooks", "intuit"],
                "Xero": ["xero.com", "xero accounting"],
                "Stripe": ["stripe.com", "stripe payments"],
                "HubSpot": ["hubspot", "hs-scripts"],
                "Salesforce": ["salesforce", "force.com"],
                "WordPress": ["wp-content", "wordpress"],
                "React": ["react", "reactjs"],
                "Next.js": ["next.js", "nextjs", "_next/"],
            }
            html_lower = html.lower()
            for tech, patterns in tech_signals.items():
                if any(p in html_lower for p in patterns):
                    enrichment["company_technologies"].append(tech)

            # Check for hiring/careers signals
            hiring_patterns = [
                "careers", "jobs", "we're hiring", "we are hiring",
                "join our team", "open positions", "work with us",
            ]
            for pattern in hiring_patterns:
                if pattern in html_lower:
                    enrichment["hiring_signals"].append(pattern)
                    break

    except requests.RequestException as e:
        logger.debug("Could not scrape %s: %s", website, e)

    # Try /careers or /jobs page for hiring signals
    for path in ["/careers", "/jobs", "/about"]:
        try:
            careers_resp = requests.get(
                f"{website.rstrip('/')}{path}",
                timeout=8,
                headers={"User-Agent": "Mozilla/5.0 (compatible; ResourceMatch/1.0)"},
                allow_redirects=True,
            )
            if careers_resp.ok and careers_resp.url != website:
                # Found a careers/about page
                if path == "/about" and not enrichment["company_description"]:
                    # Try to get a better description from about page
                    about_meta = re.search(
                        r'<meta\s+(?:name|property)=["\']description["\']\s+'
                        r'content=["\']([^"\']+)["\']',
                        careers_resp.text, re.IGNORECASE,
                    )
                    if about_meta:
                        enrichment["company_description"] = about_meta.group(1).strip()
                elif path in ("/careers", "/jobs"):
                    enrichment["hiring_signals"].append(f"has {path} page")
        except requests.RequestException:
            pass

    lead["enrichment"] = enrichment
    return lead


def enrich_from_signal(lead, signal):
    """Enrich a lead using job board signal data.

    When we found the company via a job board posting, we already know
    they're hiring for relevant roles.
    """
    lead["enrichment"] = lead.get("enrichment", {})
    lead["enrichment"]["hiring_signals"] = lead["enrichment"].get("hiring_signals", [])

    lead["enrichment"]["hiring_signals"].append(
        f"Actively hiring: {signal['job_title']} (via {signal['source']})"
    )
    lead["enrichment"]["signal_vertical"] = signal.get("vertical")
    lead["enrichment"]["signal_source"] = signal.get("source")
    lead["enrichment"]["signal_job_url"] = signal.get("job_url")

    return lead


def batch_enrich(leads, max_concurrent=5):
    """Enrich a batch of leads. Returns enriched leads."""
    enriched = []
    for lead in leads[:max_concurrent]:
        try:
            enriched.append(enrich_lead(lead))
        except Exception as e:
            logger.warning("Enrichment failed for %s: %s", lead.get("email"), e)
            lead["enrichment"] = {}
            enriched.append(lead)
    return enriched
