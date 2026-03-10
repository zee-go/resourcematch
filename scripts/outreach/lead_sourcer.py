"""Lead sourcing via Apollo.io API (free tier: 60 email credits/month).

Searches for prospects matching ResourceMatch's ICP:
- Hiring managers, HR leaders, COOs, VP Finance at remote-friendly companies
- Company size: 20-500 employees
- Industries: e-commerce, SaaS, professional services, finance
"""

import logging

import requests

from scripts.outreach.config import get_apollo_api_key

logger = logging.getLogger(__name__)

APOLLO_API_BASE = "https://api.apollo.io/api/v1"

# ICP filters by segment
ICP_SEGMENTS = {
    "hiring_managers": {
        "person_titles": [
            "VP HR", "VP Human Resources", "Head of HR",
            "Director Talent Acquisition", "Head of Talent",
            "Director of HR", "Chief People Officer",
            "Talent Acquisition Manager",
        ],
        "person_seniorities": ["vp", "director", "manager"],
    },
    "finance_leaders": {
        "person_titles": [
            "VP Finance", "Controller", "CFO", "Chief Financial Officer",
            "Director of Finance", "Head of Finance",
            "Finance Manager", "Accounting Manager",
        ],
        "person_seniorities": ["vp", "director", "c_suite"],
    },
    "ops_leaders": {
        "person_titles": [
            "COO", "VP Operations", "Director of Operations",
            "Head of Operations", "Operations Manager",
            "Director of E-commerce", "E-commerce Manager",
        ],
        "person_seniorities": ["vp", "director", "c_suite", "manager"],
    },
    "founders": {
        "person_titles": [
            "CEO", "Founder", "Co-Founder", "Managing Director",
            "Owner", "President",
        ],
        "person_seniorities": ["c_suite", "founder"],
    },
}

# Shared company filters
COMPANY_FILTERS = {
    "organization_num_employees_ranges": ["20,50", "51,200", "201,500"],
    "organization_locations": ["United States"],
}


def search_people(segment="hiring_managers", per_page=10, page=1):
    """Search Apollo for people matching an ICP segment.

    Returns a list of prospect dicts with name, email, title, company info.
    Uses 1 email credit per person with a revealed email.
    """
    api_key = get_apollo_api_key()

    segment_config = ICP_SEGMENTS.get(segment, ICP_SEGMENTS["hiring_managers"])

    payload = {
        "page": page,
        "per_page": per_page,
        "person_titles": segment_config["person_titles"],
        "person_seniorities": segment_config.get("person_seniorities", []),
        **COMPANY_FILTERS,
    }

    headers = {
        "X-Api-Key": api_key,
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(
            f"{APOLLO_API_BASE}/mixed_people/search",
            json=payload,
            headers=headers,
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as e:
        logger.error("Apollo search failed: %s", e)
        return []

    prospects = []
    for person in data.get("people", []):
        email = person.get("email")
        if not email:
            continue

        org = person.get("organization", {})
        prospect = {
            "name": person.get("name", ""),
            "first_name": person.get("first_name", ""),
            "last_name": person.get("last_name", ""),
            "email": email.lower(),
            "title": person.get("title", ""),
            "linkedin_url": person.get("linkedin_url", ""),
            "company_name": org.get("name", ""),
            "company_website": org.get("website_url", ""),
            "company_size": org.get("estimated_num_employees"),
            "company_industry": org.get("industry", ""),
            "company_location": org.get("primary_domain", ""),
            "segment": segment,
            "source": "apollo",
        }
        prospects.append(prospect)

    logger.info(
        "Apollo search (%s): found %d prospects (page %d)",
        segment, len(prospects), page,
    )
    return prospects


def get_daily_leads(max_credits=3):
    """Source a small batch of leads across segments, respecting free tier limits.

    With 60 credits/month and ~20 working days, budget is ~3 credits/day.
    Rotates through segments to maintain variety.
    """
    from scripts.outreach.state import get_state

    state = get_state()
    last_segment_idx = state.get("last_segment_index", -1)
    segments = list(ICP_SEGMENTS.keys())

    all_prospects = []
    credits_used = 0

    for i in range(len(segments)):
        if credits_used >= max_credits:
            break

        segment_idx = (last_segment_idx + 1 + i) % len(segments)
        segment = segments[segment_idx]
        remaining = max_credits - credits_used

        prospects = search_people(
            segment=segment,
            per_page=remaining,
        )

        all_prospects.extend(prospects)
        credits_used += len(prospects)

        # Update segment rotation
        state["last_segment_index"] = segment_idx

    from scripts.outreach.state import save_state
    save_state(state)

    return all_prospects
