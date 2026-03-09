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
from scripts.outreach.persona import get_system_prompt

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

    prompt = f"""Write two LinkedIn messages for this candidate.

CANDIDATE CONTEXT:
{json.dumps(candidate_context, indent=2)}

VERTICAL FOCUS: {vertical}

WRITE TWO MESSAGES:

1. CONNECTION NOTE (max 300 characters, hard LinkedIn limit):
   - Brief, personal
   - Reference something specific about them if possible
   - Mention ResourceMatch naturally
   - End with a reason to connect

2. FOLLOW-UP MESSAGE (send after they accept connection, 100-150 words):
   - Invite them to create a profile on ResourceMatch
   - Explain: it's free, takes a few minutes, they upload a resume and fill out their background
   - Once they have a profile, they get AI-vetted and matched to international companies
   - CTA: "Create your profile at resourcematch.ph/apply"

Return JSON:
{{
    "connection_note": "connection note here (max 300 chars)",
    "followup_message": "follow-up message here"
}}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=get_system_prompt("linkedin_candidate"),
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

    prompt = f"""Draft a public comment and a private DM for this Reddit post.

POST CONTEXT:
Subreddit: r/{post_context.get('subreddit', '?')}
Title: {post_context.get('title', '')}
Body: {post_context.get('text', '')[:500]}
Author: u/{post_context.get('author', '?')}

PUBLIC COMMENT RULES:
- Be genuinely helpful first (answer their question, give advice)
- Only mention ResourceMatch if it naturally fits the context
- 2-4 sentences max
- Match the subreddit's tone (r/phcareers is professional, r/buhaydigital is casual)

DM RULES:
- Invite them to create a profile on ResourceMatch
- Keep it short (3-5 sentences)
- Mention it's free and takes a few minutes
- CTA: "Create your profile at resourcematch.ph/apply"

Return JSON:
{{
    "comment": "public comment text",
    "dm": "private message text"
}}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=get_system_prompt("reddit_candidate"),
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
