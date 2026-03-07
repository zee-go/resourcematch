"""Traffic history persistence — stores weekly GSC snapshots for trend tracking."""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
TRAFFIC_FILE = DATA_DIR / "seo_traffic.json"

MAX_WEEKS = 52  # Keep 1 year of history


def get_traffic_history():
    """Read traffic history. Returns default structure if missing."""
    try:
        if TRAFFIC_FILE.exists():
            with open(TRAFFIC_FILE) as f:
                return json.load(f)
    except (json.JSONDecodeError, OSError):
        pass
    return {"weekly_snapshots": []}


def save_traffic_snapshot(report):
    """Append a weekly snapshot from a traffic report. Prunes old entries."""
    history = get_traffic_history()
    snapshot = {
        "week_start": report["current_week"]["start"],
        "week_end": report["current_week"]["end"],
        "recorded_at": report["report_date"],
        "site_totals": report["site_totals"]["current"],
        "pages": [
            {
                "slug": p["slug"],
                "impressions": p.get("impressions", 0),
                "clicks": p.get("clicks", 0),
                "ctr": p.get("ctr", 0.0),
                "position": p.get("position", 0.0),
            }
            for p in report.get("pages", [])
            if not p.get("no_data")
        ],
        "top_queries": report.get("top_queries", [])[:10],
    }

    # Avoid duplicate snapshots for the same week
    history["weekly_snapshots"] = [
        s for s in history["weekly_snapshots"]
        if s.get("week_start") != snapshot["week_start"]
    ]
    history["weekly_snapshots"].append(snapshot)

    # Prune to max weeks
    history["weekly_snapshots"] = history["weekly_snapshots"][-MAX_WEEKS:]

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(TRAFFIC_FILE, "w") as f:
        json.dump(history, f, indent=2)
    logger.info("Saved traffic snapshot for week of %s", snapshot["week_start"])


def get_previous_snapshot():
    """Return the most recent snapshot for comparison, or None."""
    history = get_traffic_history()
    snapshots = history.get("weekly_snapshots", [])
    return snapshots[-1] if snapshots else None
