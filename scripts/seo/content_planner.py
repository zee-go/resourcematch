"""Content planner — decides what to write this week based on strategy and state."""

import datetime
import logging

from scripts.seo.state import get_state, get_calendar, save_calendar
from scripts.seo.topic_researcher import research_topics, CONTENT_PILLARS

logger = logging.getLogger(__name__)

WEEKLY_TARGET = 2
BLOG_PER_WEEK = 2


def _get_next_pillar_focus(state):
    """Rotate through pillars, prioritizing those with fewest pages."""
    cluster_counts = state.get("topic_clusters", {})
    pillar_keys = list(CONTENT_PILLARS.keys())
    pillar_keys.sort(key=lambda k: len(cluster_counts.get(k, [])))
    return pillar_keys[0]


def generate_weekly_plan():
    """Generate this week's content calendar.

    Returns:
        dict with week_start, week_number, focus_pillar, items
    """
    state = get_state()
    today = datetime.date.today()
    week_start = today - datetime.timedelta(days=today.weekday())

    existing = get_calendar()
    if existing.get("week_start") == week_start.isoformat():
        return existing

    topics = research_topics(count=4)

    selected = [t for t in topics if t["page_type"] == "blog"][:BLOG_PER_WEEK]
    if len(selected) < WEEKLY_TARGET:
        remaining = [t for t in topics if t not in selected]
        selected.extend(remaining[:WEEKLY_TARGET - len(selected)])

    publish_days = [1, 3]  # Tuesday, Thursday
    items = []
    for i, topic in enumerate(selected[:WEEKLY_TARGET]):
        day_offset = publish_days[i] if i < len(publish_days) else publish_days[-1]
        publish_date = week_start + datetime.timedelta(days=day_offset)
        items.append({
            **topic,
            "publish_date": publish_date.isoformat(),
            "status": "planned",
        })

    calendar = {
        "week_start": week_start.isoformat(),
        "week_number": state.get("week_number", 0) + 1,
        "focus_pillar": _get_next_pillar_focus(state),
        "items": items,
    }

    save_calendar(calendar)
    logger.info("Generated weekly SEO plan: %d items for week of %s",
                len(items), week_start.isoformat())
    return calendar
