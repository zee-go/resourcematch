"""SEO agent state management — tracks published content, keyword coverage, calendar."""

import json
import datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
STATE_FILE = DATA_DIR / "seo_state.json"
CALENDAR_FILE = DATA_DIR / "seo_calendar.json"


def get_state():
    """Read SEO state. Returns default if missing."""
    try:
        if STATE_FILE.exists():
            with open(STATE_FILE) as f:
                return json.load(f)
    except (json.JSONDecodeError, OSError):
        pass
    return {
        "total_published": 0,
        "blog_posts": [],
        "keyword_coverage": {},
        "topic_clusters": {},
        "last_run_date": None,
        "week_number": 0,
    }


def save_state(state):
    """Persist SEO state."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def record_publication(page_type, slug, title, keywords, category):
    """Record a published page to state. Replaces existing entry for same slug."""
    state = get_state()
    entry = {
        "slug": slug,
        "title": title,
        "date": datetime.date.today().isoformat(),
        "keywords": keywords,
        "category": category,
    }

    # Remove existing entry with same slug (re-publish / regeneration)
    existing = [p for p in state["blog_posts"] if p["slug"] == slug]
    if existing:
        state["blog_posts"] = [p for p in state["blog_posts"] if p["slug"] != slug]
    else:
        state["total_published"] += 1

    state["blog_posts"].append(entry)

    for kw in keywords:
        if kw not in state["keyword_coverage"]:
            state["keyword_coverage"][kw] = []
        if slug not in state["keyword_coverage"][kw]:
            state["keyword_coverage"][kw].append(slug)

    if category not in state["topic_clusters"]:
        state["topic_clusters"][category] = []
    if slug not in state["topic_clusters"][category]:
        state["topic_clusters"][category].append(slug)

    state["last_run_date"] = datetime.date.today().isoformat()
    save_state(state)


def get_calendar():
    """Read current week's content calendar."""
    try:
        if CALENDAR_FILE.exists():
            with open(CALENDAR_FILE) as f:
                return json.load(f)
    except (json.JSONDecodeError, OSError):
        pass
    return {}


def save_calendar(calendar):
    """Persist content calendar."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(CALENDAR_FILE, "w") as f:
        json.dump(calendar, f, indent=2)
