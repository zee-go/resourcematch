"""Maya — formats outreach data for Telegram preview messages."""


def format_prospect_preview(prospect, candidates, email_sequence):
    """Format a prospect + email sequence preview for Telegram approval."""
    lines = [
        "--- OUTREACH PREVIEW ---\n",
        f"Prospect: {prospect.get('first_name', '')} {prospect.get('last_name', '')}",
        f"Title: {prospect.get('title', '')}",
        f"Company: {prospect.get('company_name', '')}",
    ]

    if prospect.get("company_size"):
        lines.append(f"Size: ~{prospect['company_size']} employees")

    enrichment = prospect.get("enrichment", {})
    if enrichment.get("hiring_signals"):
        lines.append(f"Signals: {', '.join(enrichment['hiring_signals'][:3])}")

    if candidates:
        lines.append(f"\nMatched Candidates ({len(candidates)}):")
        for c in candidates[:3]:
            lines.append(
                f"  - {c['name']} | {c['experience_years']}yr | "
                f"Score {c['vetting_score']}/100"
            )

    if email_sequence and email_sequence.get("emails"):
        email_1 = email_sequence["emails"][0]
        lines.append(f"\nEmail Subject: {email_1.get('subject', '')}")
        body = email_1.get("body", "")
        preview = body[:300] + "..." if len(body) > 300 else body
        lines.append(f"\n{preview}")
        lines.append(f"\nFull sequence: {len(email_sequence['emails'])} emails")

    lines.append("\n--- END PREVIEW ---")
    return "\n".join(lines)


def format_batch_summary(batch_results):
    """Format a sending batch summary."""
    return (
        f"[Maya] Batch Complete\n\n"
        f"Sent: {batch_results.get('sent_count', 0)}\n"
        f"Failed: {batch_results.get('failed_count', 0)}\n"
        f"Bounced: {batch_results.get('bounced_count', 0)}"
    )


def format_daily_summary(state, daily_limit):
    """Format a daily outreach summary for Telegram."""
    leads = state.get("leads", [])
    status_counts = {}
    for lead in leads:
        s = lead.get("status", "unknown")
        status_counts[s] = status_counts.get(s, 0) + 1

    lines = [
        "[Maya] Daily Outreach Summary\n",
        f"Warmup day: {state.get('warmup_day', 0)} (limit: {daily_limit}/day)",
        f"Total leads: {len(leads)}",
    ]

    for status in ["new", "enriched", "queued", "sent", "replied", "bounced", "opted_out"]:
        count = status_counts.get(status, 0)
        if count > 0:
            lines.append(f"  {status}: {count}")

    lines.append(f"\nLifetime: {state.get('total_sent', 0)} sent, "
                 f"{state.get('total_replied', 0)} replied, "
                 f"{state.get('total_bounced', 0)} bounced")

    if state.get("total_sent", 0) > 0:
        reply_rate = state["total_replied"] / state["total_sent"] * 100
        lines.append(f"Reply rate: {reply_rate:.1f}%")

    return "\n".join(lines)


def format_weekly_report(snapshot, previous=None):
    """Format a weekly outreach metrics report."""
    lines = [
        "[Maya] Weekly Outreach Report\n",
        f"Week of: {snapshot.get('week_start', 'Unknown')}\n",
        f"Total sourced: {snapshot.get('total_sourced', 0)}",
        f"Total sent: {snapshot.get('total_sent', 0)}",
        f"Total replied: {snapshot.get('total_replied', 0)}",
        f"Total bounced: {snapshot.get('total_bounced', 0)}",
        f"Active sequences: {snapshot.get('active_leads', 0)}",
        f"\nReply rate: {snapshot.get('reply_rate', 0)}%",
        f"Bounce rate: {snapshot.get('bounce_rate', 0)}%",
    ]

    if previous:
        prev_reply = previous.get("reply_rate", 0)
        curr_reply = snapshot.get("reply_rate", 0)
        delta = curr_reply - prev_reply
        if abs(delta) >= 0.5:
            arrow = "\u2191" if delta > 0 else "\u2193"
            lines.append(f"Reply rate trend: {arrow} {abs(delta):.1f}% vs last week")

    return "\n".join(lines)


def format_followup_preview(lead, email):
    """Format a follow-up email preview."""
    return (
        f"--- FOLLOW-UP (Touch {email.get('step', '?')}) ---\n\n"
        f"To: {lead.get('name', '')} ({lead.get('email', '')})\n"
        f"Subject: {email.get('subject', '')}\n\n"
        f"{email.get('body', '')}\n\n"
        f"--- END ---"
    )
