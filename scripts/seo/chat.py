"""Free-form chat handler — routes non-command messages to Claude for SEO advice."""

import logging

import anthropic

from scripts.seo.config import _get_secret
from scripts.seo.state import get_state

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Kelly, the SEO content strategist for ResourceMatch (resourcematch.ph).

ResourceMatch is a B2B marketplace connecting international companies with AI-vetted senior Filipino professionals (5-10+ years experience). Verticals: Finance & Accounting, Operations Management.

You help with:
- SEO strategy for resourcematch.ph
- Content planning and keyword research
- Blog post ideation and optimization
- Philippine outsourcing industry insights
- Competitive analysis for talent platform SEO

Keep responses concise and actionable. You have deep knowledge of:
- Philippine BPO/outsourcing market
- SEO best practices (E-E-A-T, content clusters, technical SEO)
- The ResourceMatch platform (4-layer AI vetting pipeline, pricing, target audience)

Current SEO state:
{state_context}

Respond in a professional but approachable tone. Be direct and specific. Keep answers under 500 words unless the question warrants more detail."""


def handle_free_text(text):
    """Send user's message to Claude and relay the response via Telegram."""
    from scripts.seo.bot import send, run_in_background

    if not run_in_background("chat", _do_chat, text):
        send("I'm busy with another task right now. Try again in a moment.")
        return


def _do_chat(text):
    from scripts.seo.bot import send

    api_key = _get_secret("anthropic-api-key")
    client = anthropic.Anthropic(api_key=api_key, max_retries=3)

    state = get_state()
    state_context = (
        f"Total published posts: {state.get('total_published', 0)}\n"
        f"Keywords covered: {len(state.get('keyword_coverage', {}))}\n"
        f"Topic clusters: {list(state.get('topic_clusters', {}).keys())}\n"
        f"Last run: {state.get('last_run_date', 'never')}"
    )

    system = SYSTEM_PROMPT.format(state_context=state_context)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=system,
        messages=[{"role": "user", "content": text}],
    )

    response = message.content[0].text
    send(response)
