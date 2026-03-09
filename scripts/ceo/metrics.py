"""KPI tracker — read/update weekly metrics snapshots."""

import json
from datetime import datetime, date

from scripts.ceo.config import METRICS_FILE, DATA_DIR


def _ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_metrics():
    """Load the full metrics history."""
    if METRICS_FILE.exists():
        return json.loads(METRICS_FILE.read_text())
    return {"snapshots": [], "current": _blank_snapshot()}


def save_metrics(data):
    """Save metrics to disk."""
    _ensure_data_dir()
    METRICS_FILE.write_text(json.dumps(data, indent=2, default=str))


def _blank_snapshot():
    """Return a blank weekly snapshot template."""
    return {
        "week_ending": str(date.today()),
        "supply": {
            "applications_received": 0,
            "candidates_vetted": 0,
            "total_vetted_live": 0,
            "vetting_completion_rate": 0,
            "referral_applications": 0,
        },
        "demand": {
            "new_company_signups": 0,
            "total_registered_companies": 0,
            "jobs_posted": 0,
            "profile_views": 0,
        },
        "revenue": {
            "unlocks_this_week": 0,
            "revenue_this_week": 0,
            "mrr": 0,
            "total_placements": 0,
            "active_subscribers": 0,
        },
        "funnel": {
            "visitors": 0,
            "signups": 0,
            "free_unlocks_used": 0,
            "paid_unlocks": 0,
            "subscription_conversions": 0,
        },
        "health": {
            "candidate_churn_pct": 0,
            "company_churn_pct": 0,
            "avg_time_to_match_hours": 0,
            "support_tickets": 0,
            "nps_companies": 0,
            "nps_candidates": 0,
        },
        "outreach": {
            "emails_sent": 0,
            "replies_received": 0,
            "reply_rate_pct": 0,
            "bounces": 0,
            "linkedin_sent": 0,
            "linkedin_accepted": 0,
            "meetings_booked": 0,
            "leads_sourced": 0,
        },
    }


def get_latest_snapshot():
    """Get the most recent metrics snapshot."""
    data = load_metrics()
    if data["snapshots"]:
        return data["snapshots"][-1]
    return data["current"]


def record_snapshot(snapshot=None):
    """Save the current snapshot to history and reset current."""
    data = load_metrics()
    to_save = snapshot or data["current"]
    to_save["week_ending"] = str(date.today())
    to_save["recorded_at"] = datetime.now().isoformat()
    data["snapshots"].append(to_save)
    data["current"] = _blank_snapshot()
    save_metrics(data)
    return to_save


def update_current(category, field, value):
    """Update a field in the current snapshot.

    Usage: update_current("supply", "applications_received", 5)
    """
    data = load_metrics()
    if category in data["current"] and field in data["current"][category]:
        data["current"][category][field] = value
        save_metrics(data)
        return True
    return False


def get_variance_report():
    """Compare latest metrics against targets from the playbook."""
    snapshot = get_latest_snapshot()

    # Month 1-3 targets (from playbook)
    targets = {
        "supply.applications_received": {"target": 10, "unit": "/week", "label": "Applications"},
        "supply.candidates_vetted": {"target": 3, "unit": "/week", "label": "Candidates vetted"},
        "demand.new_company_signups": {"target": 5, "unit": "/week", "label": "Company signups"},
        "revenue.unlocks_this_week": {"target": 2, "unit": "/week", "label": "Profile unlocks"},
        "revenue.revenue_this_week": {"target": 125, "unit": "$", "label": "Weekly revenue"},
        "outreach.emails_sent": {"target": 30, "unit": "/week", "label": "Outreach emails"},
        "outreach.replies_received": {"target": 3, "unit": "/week", "label": "Outreach replies"},
        "outreach.meetings_booked": {"target": 1, "unit": "/week", "label": "Meetings booked"},
    }

    report = []
    for key, info in targets.items():
        category, field = key.split(".")
        actual = snapshot.get(category, {}).get(field, 0)
        target = info["target"]
        pct = (actual / target * 100) if target > 0 else 0
        status = "on_track" if pct >= 80 else "behind" if pct >= 50 else "critical"
        report.append({
            "metric": info["label"],
            "actual": actual,
            "target": target,
            "unit": info["unit"],
            "pct_of_target": round(pct, 1),
            "status": status,
        })

    return report


def format_variance_report():
    """Return a human-readable variance report."""
    report = get_variance_report()
    lines = ["## Weekly Variance Report", ""]
    status_icons = {"on_track": "+", "behind": "~", "critical": "!"}

    for item in report:
        icon = status_icons[item["status"]]
        lines.append(
            f"[{icon}] {item['metric']}: {item['actual']}{item['unit']} "
            f"(target: {item['target']}{item['unit']}, {item['pct_of_target']}%)"
        )

    return "\n".join(lines)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "snapshot":
        snapshot = record_snapshot()
        print(f"Snapshot recorded for {snapshot['week_ending']}")
    elif len(sys.argv) > 3 and sys.argv[1] == "update":
        category, field = sys.argv[2], sys.argv[3]
        value = int(sys.argv[4]) if sys.argv[4].isdigit() else float(sys.argv[4])
        if update_current(category, field, value):
            print(f"Updated {category}.{field} = {value}")
        else:
            print(f"Unknown field: {category}.{field}")
    elif len(sys.argv) > 1 and sys.argv[1] == "report":
        print(format_variance_report())
    else:
        print("Usage:")
        print("  python -m scripts.ceo.metrics snapshot     # Save weekly snapshot")
        print("  python -m scripts.ceo.metrics update <category> <field> <value>")
        print("  python -m scripts.ceo.metrics report       # Variance report")
        print()
        print("Categories: supply, demand, revenue, funnel, health, outreach")
        print()
        latest = get_latest_snapshot()
        print(json.dumps(latest, indent=2))
