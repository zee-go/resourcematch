"""Email composer — Claude-powered personalized email sequences.

Generates a 4-touch email sequence for each prospect:
1. Cold intro (Day 0) — value prop + specific candidate match
2. Follow-up 1 (Day 3) — social proof / case study
3. Follow-up 2 (Day 7) — new angle or relevant content
4. Breakup (Day 14) — last touch, leave door open
"""

import json
import logging
from pathlib import Path

import anthropic

from scripts.outreach.config import get_anthropic_api_key, get_physical_address
from scripts.outreach.persona import get_system_prompt

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"


def _load_template(name):
    """Load an email template scaffold."""
    path = TEMPLATES_DIR / f"{name}.md"
    if path.exists():
        return path.read_text()
    return ""


def compose_sequence(prospect, matched_candidates):
    """Generate a full 4-email sequence for a prospect using Claude.

    Args:
        prospect: dict with name, title, company, enrichment, etc.
        matched_candidates: list of candidate dicts from candidate_matcher

    Returns:
        dict with keys: subject_lines (list), emails (list of dicts with subject, body, step)
    """
    client = anthropic.Anthropic(api_key=get_anthropic_api_key())

    # Build context for Claude
    prospect_context = _build_prospect_context(prospect)
    candidate_context = _build_candidate_context(matched_candidates)
    templates = {
        "cold_intro": _load_template("cold_intro"),
        "followup_1": _load_template("followup_1"),
        "followup_2": _load_template("followup_2"),
        "breakup": _load_template("breakup"),
    }

    physical_address = get_physical_address()

    prompt = f"""Write a 4-touch email sequence for this prospect.

PROSPECT CONTEXT:
{prospect_context}

MATCHED CANDIDATES FROM OUR PLATFORM:
{candidate_context}

EMAIL SEQUENCE TEMPLATES (use as scaffolding, not fill-in-the-blank):
---
Touch 1 (Cold Intro, send immediately):
{templates.get('cold_intro', 'Introduce ResourceMatch value prop + mention 1-2 matched candidates')}
---
Touch 2 (Follow-up 1, 3 days later):
{templates.get('followup_1', 'Social proof, platform stats, or relevant case study')}
---
Touch 3 (Follow-up 2, 7 days later):
{templates.get('followup_2', 'Different angle: cost savings, time-to-hire, or a relevant blog post')}
---
Touch 4 (Breakup, 14 days later):
{templates.get('breakup', 'Last touch, leave the door open, no pressure')}
---

FORMAT RULES:
1. Reference specific details about the prospect's company, role, or hiring signals
2. In Touch 1, mention 1-2 specific matched candidates by first name, years of experience, and a standout skill
3. Keep emails SHORT: Touch 1 = 80-120 words, Touch 2-3 = 60-80 words, Touch 4 = 40-60 words
4. One clear CTA per email (typically: "Want me to send you their profiles?" or "Open to a quick chat?")
5. Subject lines: under 7 words, lowercase style (not Title Case), no clickbait
6. Each email must include this footer (do not modify):
    ---
    Sent by ResourceMatch | AI-vetted senior Filipino professionals
    {physical_address}
    Reply STOP to unsubscribe

Return your response as a JSON object with this exact structure:
{{
  "emails": [
    {{
      "step": 1,
      "subject": "subject line here",
      "body": "email body here (plain text, include the footer)",
      "variant_subject": "alternative subject line for A/B testing"
    }},
    {{
      "step": 2,
      "subject": "...",
      "body": "...",
      "variant_subject": "..."
    }},
    {{
      "step": 3,
      "subject": "...",
      "body": "...",
      "variant_subject": "..."
    }},
    {{
      "step": 4,
      "subject": "...",
      "body": "...",
      "variant_subject": "..."
    }}
  ]
}}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=get_system_prompt("email_company"),
            messages=[{"role": "user", "content": prompt}],
        )

        content = response.content[0].text

        # Extract JSON from response (handle markdown code blocks)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        result = json.loads(content.strip())

        # Attach prospect email for reference
        result["prospect_email"] = prospect.get("email", "")
        result["prospect_name"] = prospect.get("name", "")

        logger.info("Generated email sequence for %s", prospect.get("email"))
        return result

    except Exception as e:
        logger.error("Email composition failed for %s: %s", prospect.get("email"), e)
        return None


def _build_prospect_context(prospect):
    """Build a natural-language context string about the prospect."""
    lines = [
        f"Name: {prospect.get('first_name', '')} {prospect.get('last_name', '')}",
        f"Title: {prospect.get('title', 'Unknown')}",
        f"Company: {prospect.get('company_name', 'Unknown')}",
    ]

    if prospect.get("company_industry"):
        lines.append(f"Industry: {prospect['company_industry']}")
    if prospect.get("company_size"):
        lines.append(f"Company size: ~{prospect['company_size']} employees")
    if prospect.get("company_website"):
        lines.append(f"Website: {prospect['company_website']}")

    enrichment = prospect.get("enrichment", {})
    if enrichment.get("company_description"):
        lines.append(f"About: {enrichment['company_description']}")
    if enrichment.get("company_technologies"):
        lines.append(f"Tech stack: {', '.join(enrichment['company_technologies'])}")
    if enrichment.get("hiring_signals"):
        lines.append(f"Hiring signals: {', '.join(enrichment['hiring_signals'])}")

    return "\n".join(lines)


def _build_candidate_context(candidates):
    """Build a context string about matched candidates."""
    if not candidates:
        return "No specific candidate matches found. Focus on the platform's value prop."

    lines = []
    for i, c in enumerate(candidates, 1):
        skills_str = ", ".join(c.get("top_skills", [])[:4])
        tools_str = ", ".join(c.get("top_tools", [])[:3])
        lines.append(
            f"{i}. {c['name']} — {c['title']}\n"
            f"   {c['experience_years']} years experience | "
            f"Vetting score: {c['vetting_score']}/100\n"
            f"   Skills: {skills_str}\n"
            f"   Tools: {tools_str}\n"
            f"   {c.get('case_studies', 0)} case studies, "
            f"{c.get('certifications', 0)} certifications, "
            f"{c.get('verified_references', 0)} verified references"
        )

    return "\n".join(lines)
