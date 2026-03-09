"""Weekly strategic review — auto-generates review based on current metrics."""

import logging

from scripts.ceo.config import get_anthropic_key, DEFAULT_MODEL
from scripts.ceo.system_prompt import build_system_prompt
from scripts.ceo.metrics import get_latest_snapshot, format_variance_report, get_current_month

logger = logging.getLogger(__name__)


def get_current_month():
    """Get the current strategic month number."""
    from scripts.ceo.system_prompt import get_current_month as _get_month
    return _get_month()


def generate_weekly_review():
    """Generate an AI-powered weekly strategic review."""
    import anthropic

    client = anthropic.Anthropic(api_key=get_anthropic_key())
    system = build_system_prompt()
    variance = format_variance_report()
    snapshot = get_latest_snapshot()
    month = get_current_month()

    user_prompt = f"""Generate this week's strategic review for ResourceMatch.

Current metrics snapshot:
{variance}

We are in Month {month} of the 18-month plan.

Please provide:
1. **Status Summary** — One paragraph on where we stand vs. plan
2. **What's Working** — Top 2-3 things going well
3. **What's Not Working** — Top 2-3 things that need attention
4. **This Week's Top 3 Priorities** — Specific, actionable tasks for this week
5. **Key Decision Needed** — One decision the founder should make this week
6. **Risk Alert** — Any emerging risks to flag

Keep it actionable and concise. No fluff."""

    response = client.messages.create(
        model=DEFAULT_MODEL,
        max_tokens=2000,
        system=system,
        messages=[{"role": "user", "content": user_prompt}],
    )

    return response.content[0].text


def print_weekly_review():
    """Print the weekly review to stdout."""
    print("=" * 60)
    print("  RESOURCEMATCH — WEEKLY STRATEGIC REVIEW")
    print("=" * 60)
    print()

    try:
        review = generate_weekly_review()
        print(review)
    except Exception as e:
        logger.error("Failed to generate review: %s", e)
        print(f"Error generating review: {e}")
        print()
        print("Falling back to variance report:")
        print(format_variance_report())

    print()
    print("=" * 60)


if __name__ == "__main__":
    from scripts.seo.logging_setup import setup_logging
    setup_logging("ceo")
    print_weekly_review()
