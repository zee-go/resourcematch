"""Metrics tracking — monitors outreach campaign performance.

Tracks:
- Open rates (via tracking pixel, if enabled)
- Reply rates (by checking inbox or manual marking)
- Bounce rates (from SMTP rejections)
- A/B test results (subject line variants)
"""

import logging

from scripts.outreach.state import get_state, get_metrics, record_weekly_snapshot

logger = logging.getLogger(__name__)


def get_current_stats():
    """Get current campaign statistics."""
    state = get_state()
    total_sent = state.get("total_sent", 0)
    total_replied = state.get("total_replied", 0)
    total_bounced = state.get("total_bounced", 0)

    return {
        "total_sourced": state.get("total_sourced", 0),
        "total_sent": total_sent,
        "total_replied": total_replied,
        "total_bounced": total_bounced,
        "reply_rate": round(total_replied / total_sent * 100, 1) if total_sent > 0 else 0,
        "bounce_rate": round(total_bounced / total_sent * 100, 1) if total_sent > 0 else 0,
        "active_sequences": len([
            l for l in state.get("leads", [])
            if l.get("status") == "sent" and not l.get("replied") and not l.get("bounced")
        ]),
        "warmup_day": state.get("warmup_day", 0),
    }


def get_sequence_breakdown():
    """Break down leads by their current sequence step."""
    state = get_state()
    steps = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
    for lead in state.get("leads", []):
        if lead.get("status") == "sent":
            step = lead.get("sequence_step", 0)
            steps[step] = steps.get(step, 0) + 1
    return steps


def take_weekly_snapshot():
    """Take a weekly metrics snapshot for trend tracking."""
    snapshot = record_weekly_snapshot()
    logger.info("Weekly snapshot recorded: %s", snapshot)
    return snapshot


def get_previous_week_snapshot():
    """Get the previous week's snapshot for comparison."""
    metrics = get_metrics()
    snapshots = metrics.get("weekly_snapshots", [])
    if len(snapshots) >= 2:
        return snapshots[-2]
    return None
