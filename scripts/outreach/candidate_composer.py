"""Candidate composer — Claude drafts recruitment messages for LinkedIn + Reddit.

Messages are personalized to the candidate's visible profile/post and use one of
four recruitment angles:
1. Level-up: "Get AI-vetted and stand out to international companies"
2. No-risk: "Free to apply, free to get vetted. We bring the clients to you."
3. Exclusivity: "We only accept senior professionals (5+ years)."
4. Matching: "Stop cold-applying. Get matched to companies looking for your skills."
"""

import json
import logging

import anthropic

from scripts.outreach.config import get_anthropic_api_key

logger = logging.getLogger(__name__)


def compose_linkedin_recruitment(candidate_context, vertical="accounting"):
    """Draft a LinkedIn connection note + follow-up message for a candidate.

    Args:
        candidate_context: dict with name, title, summary, skills, etc.
        vertical: "accounting" or "operations"

    Returns:
        dict with connection_note (max 300 chars) and followup_message
    """
    client = anthropic.Anthropic(api_key=get_anthropic_api_key())

    prompt = f"""You are Maya, a recruitment specialist at ResourceMatch — a platform that connects
AI-vetted senior Filipino professionals with international companies.

You're reaching out to a Filipino professional on LinkedIn to recruit them to the platform.

CANDIDATE CONTEXT:
{json.dumps(candidate_context, indent=2)}

VERTICAL FOCUS: {vertical}

ABOUT RESOURCEMATCH:
- AI-vetted senior talent platform (5-10+ years experience only)
- 4-layer AI vetting: Resume Analysis, Scenario Assessment, Video Interview, Reference Verification
- Free for candidates — no cost to apply or get vetted
- Once vetted, candidates get featured to international hiring managers
- Companies pay to unlock candidate profiles — candidates never pay
- Apply at: resourcematch.ph/apply

WRITE TWO MESSAGES:

1. CONNECTION NOTE (max 300 characters, this is a hard LinkedIn limit):
   - Brief, personal, not salesy
   - Reference something specific about them if possible
   - Mention ResourceMatch naturally
   - End with a reason to connect

2. FOLLOW-UP MESSAGE (send after they accept connection, 100-150 words):
   - Explain what ResourceMatch is and why they'd be a great fit
   - Emphasize: free for candidates, AI-vetted = stand out, get matched to international roles
   - Include a clear CTA: apply at resourcematch.ph/apply
   - Warm and professional tone — colleague, not recruiter

RULES:
- No em dashes. No corporate fluff.
- Tone: friendly, direct, professional
- Do NOT oversell or make income promises
- Do NOT use "Dear" or overly formal greetings

Return JSON:
{{
    "connection_note": "connection note here (max 300 chars)",
    "followup_message": "follow-up message here"
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

        # Enforce 300 char limit on connection note
        if len(result.get("connection_note", "")) > 300:
            result["connection_note"] = result["connection_note"][:297] + "..."

        logger.info("Composed LinkedIn recruitment message for %s",
                     candidate_context.get("name", "unknown"))
        return result

    except Exception as e:
        logger.error("LinkedIn composition failed: %s", e)
        return None


def compose_reddit_reply(post_context, vertical="accounting"):
    """Draft a Reddit comment or DM for a candidate post.

    Args:
        post_context: dict with title, text, subreddit, author, url
        vertical: "accounting" or "operations"

    Returns:
        dict with comment (public reply) and dm (private message)
    """
    client = anthropic.Anthropic(api_key=get_anthropic_api_key())

    prompt = f"""You are helping ResourceMatch recruit senior Filipino professionals via Reddit.

A Filipino professional posted something relevant in a subreddit. You need to draft:
1. A public comment reply (helpful first, mention ResourceMatch naturally)
2. A private DM (more direct recruitment pitch)

POST CONTEXT:
Subreddit: r/{post_context.get('subreddit', '?')}
Title: {post_context.get('title', '')}
Body: {post_context.get('text', '')[:500]}
Author: u/{post_context.get('author', '?')}

ABOUT RESOURCEMATCH:
- Platform for AI-vetted senior Filipino professionals (5-10+ years)
- Free for candidates to apply and get vetted
- Once vetted, get featured to international companies
- Apply at: resourcematch.ph/apply
- Verticals: Finance & Accounting, Operations Management

RULES FOR PUBLIC COMMENT:
- Be genuinely helpful first (answer their question, give advice)
- Only mention ResourceMatch if it naturally fits the context
- Don't sound like an ad — sound like a fellow professional sharing a useful resource
- 2-4 sentences max
- Match the subreddit's tone (r/phcareers is professional, r/buhaydigital is casual)

RULES FOR DM:
- More direct — explain what ResourceMatch is
- Keep it short (3-5 sentences)
- Mention it's free for candidates
- Include the apply link
- Friendly, not pushy

Return JSON:
{{
    "comment": "public comment text",
    "dm": "private message text"
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
        logger.info("Composed Reddit recruitment message for u/%s",
                     post_context.get("author", "unknown"))
        return result

    except Exception as e:
        logger.error("Reddit composition failed: %s", e)
        return None
