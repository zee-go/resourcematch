"""Activity log — append dated entries to ACTIVITY_LOG.md after every run."""

import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

LOG_FILE = Path(__file__).resolve().parent / "ACTIVITY_LOG.md"


def _ensure_log_file():
    """Create the log file with a header if it doesn't exist."""
    if not LOG_FILE.exists():
        LOG_FILE.write_text("# Maya Activity Log\n\nAll outreach activity is recorded here.\n\n---\n\n")


def append_entry(entry):
    """Append a dated activity entry to the log.

    Args:
        entry: dict with keys like directive, linkedin, reddit, results, summary
    """
    _ensure_log_file()

    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d (%A)")
    time_str = now.strftime("%H:%M")

    lines = [f"## {date_str}\n"]

    # Directive
    directive = entry.get("directive")
    if directive:
        lines.append(f"**Directive:** {directive.get('primary_vertical', '?')} vertical, "
                      f"segments: {', '.join(directive.get('priority_segments', []))}")
        lines.append(f"**Source:** {directive.get('source', 'CEO bot')}")
        lines.append("")

    # LinkedIn activity
    linkedin = entry.get("linkedin", {})
    if linkedin:
        lines.append("### LinkedIn")
        if linkedin.get("searches"):
            for s in linkedin["searches"]:
                lines.append(f"- Search: \"{s['search_query']}\"")
        if linkedin.get("profiles_found", 0) > 0:
            lines.append(f"- Profiles found: {linkedin['profiles_found']}")
        drafted = linkedin.get("messages_drafted", 0)
        approved = linkedin.get("messages_approved", 0)
        skipped = linkedin.get("messages_skipped", 0)
        if drafted > 0:
            lines.append(f"- Drafted: {drafted} messages ({approved} approved, {skipped} skipped)")
        queued = linkedin.get("queued", 0)
        if queued > 0:
            lines.append(f"- Queued for sending: {queued}")
        lines.append("")

    # Reddit activity
    reddit = entry.get("reddit", {})
    if reddit:
        lines.append("### Reddit")
        scanned = reddit.get("subreddits_scanned", [])
        if scanned:
            lines.append(f"- Scanned: {', '.join('r/' + s for s in scanned)}")
        found = reddit.get("posts_found", 0)
        if found > 0:
            lines.append(f"- Relevant posts found: {found}")
        drafted = reddit.get("messages_drafted", 0)
        approved = reddit.get("messages_approved", 0)
        if drafted > 0:
            lines.append(f"- Drafted: {drafted} replies ({approved} approved)")
        lines.append("")

    # Company outreach (when active)
    company = entry.get("company_outreach", {})
    if company:
        lines.append("### Company Outreach")
        lines.append(f"- Leads sourced: {company.get('leads_sourced', 0)}")
        lines.append(f"- Emails sent: {company.get('emails_sent', 0)}")
        lines.append(f"- LinkedIn tasks: {company.get('linkedin_tasks', 0)}")
        lines.append("")

    # Results / summary
    results = entry.get("results", {})
    if results:
        lines.append("### Results")
        for key, value in results.items():
            label = key.replace("_", " ").capitalize()
            lines.append(f"- {label}: {value}")
        lines.append("")

    # Free-form notes
    notes = entry.get("notes")
    if notes:
        lines.append(f"**Notes:** {notes}")
        lines.append("")

    lines.append(f"*Run completed at {time_str}*\n")
    lines.append("---\n\n")

    # Append to file
    with open(LOG_FILE, "a") as f:
        f.write("\n".join(lines))

    logger.info("Activity log entry appended for %s", date_str)
