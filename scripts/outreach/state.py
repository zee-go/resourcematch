"""Outreach state management — tracks leads, candidates, sequences, and campaign metrics."""

import json
import datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
STATE_FILE = DATA_DIR / "outreach_state.json"
METRICS_FILE = DATA_DIR / "outreach_metrics.json"
LINKEDIN_QUEUE_FILE = DATA_DIR / "linkedin_queue.json"
CANDIDATE_STATE_FILE = DATA_DIR / "candidate_outreach_state.json"


# ─── Lead State ──────────────────────────────────────────────

def get_state():
    """Read outreach state. Returns default if missing."""
    try:
        if STATE_FILE.exists():
            with open(STATE_FILE) as f:
                return json.load(f)
    except (json.JSONDecodeError, OSError):
        pass
    return {
        "leads": [],
        "total_sourced": 0,
        "total_sent": 0,
        "total_replied": 0,
        "total_bounced": 0,
        "warmup_day": 0,
        "last_run_date": None,
        "suppression_list": [],  # emails that opted out or bounced
    }


def save_state(state):
    """Persist outreach state."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def add_leads(leads):
    """Add new leads to state, deduplicating by email."""
    state = get_state()
    existing_emails = {l["email"] for l in state["leads"]}
    suppressed = set(state.get("suppression_list", []))

    added = 0
    for lead in leads:
        email = lead["email"].lower()
        if email not in existing_emails and email not in suppressed:
            lead["email"] = email
            lead["status"] = "new"
            lead["sourced_at"] = datetime.datetime.now().isoformat()
            lead["sequence_step"] = 0
            lead["last_sent_at"] = None
            lead["replied"] = False
            lead["bounced"] = False
            state["leads"].append(lead)
            existing_emails.add(email)
            state["total_sourced"] += 1
            added += 1

    save_state(state)
    return added


def get_leads_by_status(status):
    """Get leads with a specific status (new, enriched, queued, sent, replied, bounced, opted_out)."""
    state = get_state()
    return [l for l in state["leads"] if l.get("status") == status]


def update_lead(email, updates):
    """Update a lead by email."""
    state = get_state()
    for lead in state["leads"]:
        if lead["email"] == email.lower():
            lead.update(updates)
            break
    save_state(state)


def mark_sent(email, step):
    """Mark a lead as sent for a specific sequence step."""
    state = get_state()
    for lead in state["leads"]:
        if lead["email"] == email.lower():
            lead["status"] = "sent"
            lead["sequence_step"] = step
            lead["last_sent_at"] = datetime.datetime.now().isoformat()
            state["total_sent"] += 1
            break
    save_state(state)


def mark_replied(email):
    """Mark a lead as replied — stops the sequence."""
    state = get_state()
    for lead in state["leads"]:
        if lead["email"] == email.lower():
            lead["status"] = "replied"
            lead["replied"] = True
            state["total_replied"] += 1
            break
    save_state(state)


def mark_bounced(email):
    """Mark a lead as bounced and add to suppression list."""
    state = get_state()
    email_lower = email.lower()
    for lead in state["leads"]:
        if lead["email"] == email_lower:
            lead["status"] = "bounced"
            lead["bounced"] = True
            state["total_bounced"] += 1
            break
    if email_lower not in state["suppression_list"]:
        state["suppression_list"].append(email_lower)
    save_state(state)


def add_to_suppression_list(email):
    """Add email to suppression list (opt-out, complaint, etc.)."""
    state = get_state()
    email_lower = email.lower()
    if email_lower not in state["suppression_list"]:
        state["suppression_list"].append(email_lower)
    # Also update lead status if exists
    for lead in state["leads"]:
        if lead["email"] == email_lower:
            lead["status"] = "opted_out"
            break
    save_state(state)


def get_warmup_day():
    """Get the current warmup day (0-based). Returns daily send limit."""
    state = get_state()
    day = state.get("warmup_day", 0)
    # Warmup ramp: 5 emails on day 0, +5 per day, capped at 50
    return min(5 + (day * 5), 50)


def increment_warmup_day():
    """Advance warmup by one day."""
    state = get_state()
    state["warmup_day"] = state.get("warmup_day", 0) + 1
    state["last_run_date"] = datetime.date.today().isoformat()
    save_state(state)


def get_due_followups():
    """Get leads due for follow-up based on sequence timing.

    Touch 1 (cold_intro): Day 0
    Touch 2 (followup_1): Day 3
    Touch 3 (followup_2): Day 7
    Touch 4 (breakup): Day 14
    """
    state = get_state()
    now = datetime.datetime.now()
    due = []

    followup_delays = {1: 3, 2: 7, 3: 14}  # step -> days after first send

    for lead in state["leads"]:
        if lead["status"] != "sent" or lead.get("replied") or lead.get("bounced"):
            continue
        step = lead.get("sequence_step", 0)
        if step >= 4:
            continue  # sequence complete
        last_sent = lead.get("last_sent_at")
        if not last_sent:
            continue
        last_sent_dt = datetime.datetime.fromisoformat(last_sent)
        delay = followup_delays.get(step, 0)
        if (now - last_sent_dt).days >= delay:
            due.append(lead)

    return due


# ─── LinkedIn Queue ───────────────────────────────────────────

def get_linkedin_queue():
    """Read LinkedIn message queue."""
    try:
        if LINKEDIN_QUEUE_FILE.exists():
            with open(LINKEDIN_QUEUE_FILE) as f:
                return json.load(f)
    except (json.JSONDecodeError, OSError):
        pass
    return {"pending": [], "sent": []}


def save_linkedin_queue(queue):
    """Persist LinkedIn queue."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(LINKEDIN_QUEUE_FILE, "w") as f:
        json.dump(queue, f, indent=2)


def add_to_linkedin_queue(prospect):
    """Add a prospect to the LinkedIn outreach queue."""
    queue = get_linkedin_queue()
    prospect["queued_at"] = datetime.datetime.now().isoformat()
    prospect["status"] = "pending"
    queue["pending"].append(prospect)
    save_linkedin_queue(queue)


def mark_linkedin_sent(prospect_email):
    """Move a prospect from pending to sent in LinkedIn queue."""
    queue = get_linkedin_queue()
    for i, p in enumerate(queue["pending"]):
        if p.get("email", "").lower() == prospect_email.lower():
            p["status"] = "sent"
            p["sent_at"] = datetime.datetime.now().isoformat()
            queue["sent"].append(queue["pending"].pop(i))
            break
    save_linkedin_queue(queue)


# ─── Metrics ─────────────────────────────────────────────────

def get_metrics():
    """Read campaign metrics history."""
    try:
        if METRICS_FILE.exists():
            with open(METRICS_FILE) as f:
                return json.load(f)
    except (json.JSONDecodeError, OSError):
        pass
    return {"weekly_snapshots": [], "ab_tests": []}


def save_metrics(metrics):
    """Persist metrics."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(METRICS_FILE, "w") as f:
        json.dump(metrics, f, indent=2)


def record_weekly_snapshot():
    """Take a snapshot of current outreach metrics for the week."""
    state = get_state()
    metrics = get_metrics()

    snapshot = {
        "week_start": datetime.date.today().isoformat(),
        "total_sourced": state["total_sourced"],
        "total_sent": state["total_sent"],
        "total_replied": state["total_replied"],
        "total_bounced": state["total_bounced"],
        "active_leads": len([l for l in state["leads"] if l["status"] == "sent"]),
        "reply_rate": (
            round(state["total_replied"] / state["total_sent"] * 100, 1)
            if state["total_sent"] > 0 else 0
        ),
        "bounce_rate": (
            round(state["total_bounced"] / state["total_sent"] * 100, 1)
            if state["total_sent"] > 0 else 0
        ),
    }

    # Deduplicate by week_start
    metrics["weekly_snapshots"] = [
        s for s in metrics["weekly_snapshots"]
        if s["week_start"] != snapshot["week_start"]
    ]
    metrics["weekly_snapshots"].append(snapshot)

    # Keep max 52 weeks
    metrics["weekly_snapshots"] = metrics["weekly_snapshots"][-52:]
    save_metrics(metrics)
    return snapshot


# ─── Candidate Outreach State ───────────────────────────────

def get_candidate_state():
    """Read candidate outreach state."""
    try:
        if CANDIDATE_STATE_FILE.exists():
            with open(CANDIDATE_STATE_FILE) as f:
                return json.load(f)
    except (json.JSONDecodeError, OSError):
        pass
    return {
        "candidates": [],
        "total_found": 0,
        "total_messaged": 0,
        "total_responded": 0,
        "total_applied": 0,
        "seen_reddit_urls": [],
    }


def save_candidate_state(state):
    """Persist candidate outreach state."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(CANDIDATE_STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def add_candidate_prospect(prospect):
    """Add a candidate prospect to state. Deduplicates by identifier (URL or name).

    Args:
        prospect: dict with source, name/author, url, vertical, messages, etc.

    Returns:
        True if added (new), False if duplicate.
    """
    state = get_candidate_state()
    identifier = prospect.get("url") or prospect.get("author") or prospect.get("name", "")

    # Deduplicate
    existing_ids = set()
    for c in state["candidates"]:
        existing_ids.add(c.get("url", ""))
        existing_ids.add(c.get("author", ""))
        existing_ids.add(c.get("name", ""))

    if identifier in existing_ids:
        return False

    prospect["status"] = "drafted"
    prospect["found_at"] = datetime.datetime.now().isoformat()
    state["candidates"].append(prospect)
    state["total_found"] += 1
    save_candidate_state(state)
    return True


def update_candidate_prospect(identifier, updates):
    """Update a candidate prospect by URL, author, or name."""
    state = get_candidate_state()
    for candidate in state["candidates"]:
        if identifier in (candidate.get("url"), candidate.get("author"), candidate.get("name")):
            candidate.update(updates)
            break
    save_candidate_state(state)


def mark_candidate_messaged(identifier):
    """Mark a candidate as messaged (connection sent / comment posted)."""
    state = get_candidate_state()
    for candidate in state["candidates"]:
        if identifier in (candidate.get("url"), candidate.get("author"), candidate.get("name")):
            candidate["status"] = "messaged"
            candidate["messaged_at"] = datetime.datetime.now().isoformat()
            state["total_messaged"] += 1
            break
    save_candidate_state(state)


def mark_candidate_responded(identifier):
    """Mark a candidate as responded (accepted connection, replied, etc.)."""
    state = get_candidate_state()
    for candidate in state["candidates"]:
        if identifier in (candidate.get("url"), candidate.get("author"), candidate.get("name")):
            candidate["status"] = "responded"
            state["total_responded"] += 1
            break
    save_candidate_state(state)


def mark_candidate_applied(identifier):
    """Mark a candidate as applied (submitted application on resourcematch.ph/apply)."""
    state = get_candidate_state()
    for candidate in state["candidates"]:
        if identifier in (candidate.get("url"), candidate.get("author"), candidate.get("name")):
            candidate["status"] = "applied"
            state["total_applied"] += 1
            break
    save_candidate_state(state)


def add_seen_reddit_url(url):
    """Track a Reddit URL as seen to avoid re-processing."""
    state = get_candidate_state()
    if url not in state["seen_reddit_urls"]:
        state["seen_reddit_urls"].append(url)
        # Keep last 500
        state["seen_reddit_urls"] = state["seen_reddit_urls"][-500:]
    save_candidate_state(state)


def get_candidate_stats():
    """Get candidate outreach statistics."""
    state = get_candidate_state()
    return {
        "total_found": state.get("total_found", 0),
        "total_messaged": state.get("total_messaged", 0),
        "total_responded": state.get("total_responded", 0),
        "total_applied": state.get("total_applied", 0),
        "pending_drafts": len([c for c in state["candidates"] if c.get("status") == "drafted"]),
    }
