"""LinkedIn message composer — Claude-powered personalized connection requests and messages.

Generates:
1. Connection request note (300 char limit)
2. Follow-up message (for after connection is accepted)

These are queued for manual sending — the bot does NOT automate LinkedIn.
"""

import json
import logging

import anthropic

from scripts.outreach.config import get_anthropic_api_key

logger = logging.getLogger(__name__)


def compose_linkedin_messages(prospect, matched_candidates):
    """Generate a personalized LinkedIn connection request + follow-up message.

    Args:
        prospect: dict with name, title, company, enrichment
        matched_candidates: list of candidate dicts

    Returns:
        dict with connection_note, followup_message, prospect info
    """
    client = anthropic.Anthropic(api_key=get_anthropic_api_key())

    prospect_context = _build_linkedin_context(prospect)
    candidate_brief = _build_candidate_brief(matched_candidates)

    prompt = f"""Write a LinkedIn connection request and follow-up message for ResourceMatch outreach.

PROSPECT:
{prospect_context}

RELEVANT CANDIDATES ON OUR PLATFORM:
{candidate_brief}

RULES:
1. Connection request note: MUST be under 300 characters (LinkedIn limit). Be genuine and specific. Do NOT sell.
2. Follow-up message: 40-80 words. Send after they accept. Mention 1 specific candidate match. Include a soft CTA.
3. Tone: professional peer, not salesperson. Like you're introducing a colleague to a useful resource.
4. Reference something specific about their company or role.
5. No em dashes. No "I hope this message finds you well."
6. Do NOT mention pricing.

Return JSON:
{{
  "connection_note": "...(under 300 chars)...",
  "followup_message": "...(40-80 words)..."
}}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )

        content = response.content[0].text
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        result = json.loads(content.strip())

        # Validate connection note length
        if len(result.get("connection_note", "")) > 300:
            result["connection_note"] = result["connection_note"][:297] + "..."

        result["prospect_name"] = prospect.get("name", "")
        result["prospect_email"] = prospect.get("email", "")
        result["prospect_title"] = prospect.get("title", "")
        result["prospect_company"] = prospect.get("company_name", "")
        result["linkedin_url"] = prospect.get("linkedin_url", "")

        logger.info("Generated LinkedIn messages for %s", prospect.get("name"))
        return result

    except Exception as e:
        logger.error("LinkedIn composition failed for %s: %s", prospect.get("name"), e)
        return None


def _build_linkedin_context(prospect):
    """Build context about the prospect for LinkedIn messaging."""
    lines = [
        f"Name: {prospect.get('first_name', '')} {prospect.get('last_name', '')}",
        f"Title: {prospect.get('title', '')}",
        f"Company: {prospect.get('company_name', '')}",
    ]

    enrichment = prospect.get("enrichment", {})
    if enrichment.get("company_description"):
        lines.append(f"About company: {enrichment['company_description'][:200]}")
    if enrichment.get("hiring_signals"):
        lines.append(f"Hiring signals: {', '.join(enrichment['hiring_signals'][:3])}")

    return "\n".join(lines)


def _build_candidate_brief(candidates):
    """Brief candidate summary for LinkedIn context (keep it concise)."""
    if not candidates:
        return "General platform value: AI-vetted senior Filipino professionals"

    lines = []
    for c in candidates[:2]:
        lines.append(
            f"- {c['name']}: {c['title']}, {c['experience_years']}yr exp, "
            f"score {c['vetting_score']}/100"
        )
    return "\n".join(lines)
