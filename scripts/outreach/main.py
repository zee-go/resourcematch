"""Maya — Outreach agent for ResourceMatch.

Daily pipeline: source leads -> enrich -> match candidates -> compose emails -> approve -> send.
Runs daily at 9 AM via launchd.
"""

import logging
import sys

from scripts.seo.logging_setup import setup_logging

setup_logging("outreach")
logger = logging.getLogger(__name__)


def run_daily_outreach():
    """Main daily flow: source -> enrich -> compose -> approve -> send."""
    from scripts.outreach.lead_sourcer import get_daily_leads
    from scripts.outreach.signal_scanner import get_daily_signals
    from scripts.outreach.lead_enricher import batch_enrich, enrich_from_signal
    from scripts.outreach.candidate_matcher import find_matching_candidates
    from scripts.outreach.email_composer import compose_sequence
    from scripts.outreach.linkedin_composer import compose_linkedin_messages
    from scripts.outreach.email_sender import send_batch
    from scripts.outreach.linkedin_queue import queue_linkedin_message, send_daily_linkedin_tasks
    from scripts.outreach.formatter import (
        format_prospect_preview,
        format_batch_summary,
        format_daily_summary,
    )
    from scripts.outreach.state import (
        add_leads,
        get_leads_by_status,
        update_lead,
        get_state,
        get_warmup_day,
        increment_warmup_day,
        get_due_followups,
    )
    from scripts.outreach.telegram import (
        send_telegram_message,
        send_message_with_inline_keyboard,
        poll_for_callback,
    )

    from scripts.outreach.director import (
        get_weekly_directive,
        get_current_directive,
        format_directive_for_telegram,
    )

    daily_limit = get_warmup_day()
    send_telegram_message(
        f"Hey! Maya here — starting today's outreach run.\n"
        f"Warmup status: {daily_limit} emails/day limit."
    )

    # ──────────────────────────────────────────────────────────
    # Step 0: Get weekly directive from CEO bot (once per week)
    # ──────────────────────────────────────────────────────────
    directive = get_current_directive()
    import datetime as _dt
    today = _dt.date.today()

    # Refresh directive on Mondays or if none exists
    if not directive or today.weekday() == 0:
        send_telegram_message("Consulting the Strategic Director for this week's plan...")
        try:
            directive = get_weekly_directive()
            preview = format_directive_for_telegram(directive)
            buttons = [
                {"text": "Approve plan", "callback_data": "outreach_plan_approve"},
                {"text": "Skip outreach today", "callback_data": "outreach_plan_skip"},
            ]
            msg_id = send_message_with_inline_keyboard(preview, buttons)
            response = poll_for_callback(
                prefix="outreach_plan_",
                timeout_minutes=120,
                message_id=msg_id,
                buttons=buttons,
            )

            if response != "outreach_plan_approve":
                send_telegram_message("Got it — Maya's taking today off. See you tomorrow!")
                logger.info("User skipped outreach for today.")
                return
        except Exception as e:
            logger.warning("CEO directive failed (using previous or default): %s", e)
            if not directive:
                from scripts.outreach.director import _default_directive
                directive = _default_directive()

    logger.info("Working with directive: focus=%s, segments=%s",
                directive.get("primary_vertical"), directive.get("priority_segments"))

    # ──────────────────────────────────────────────────────────
    # Step 1: Source new leads (guided by directive)
    # ──────────────────────────────────────────────────────────
    new_leads = []

    # 1a. Apollo API (free tier, ~3 credits/day)
    try:
        apollo_leads = get_daily_leads(max_credits=3)
        new_leads.extend(apollo_leads)
        logger.info("Apollo: sourced %d leads", len(apollo_leads))
    except Exception as e:
        logger.warning("Apollo sourcing failed (non-blocking): %s", e)

    # 1b. Signal scanner (job boards — free, no credit limit)
    try:
        signals = get_daily_signals()
        logger.info("Signal scanner: found %d company signals", len(signals))

        # Convert signals to lead format (may not have email yet)
        for signal in signals[:10]:  # Cap at 10 signals per day
            signal_lead = {
                "name": "",
                "first_name": "",
                "last_name": "",
                "email": "",  # Will need manual research or Apollo lookup
                "title": "",
                "company_name": signal["company_name"],
                "company_website": "",
                "segment": "signal",
                "source": signal["source"],
                "signal_data": signal,
            }
            # Only add if we can find an email (enrichment step)
            if signal_lead.get("email"):
                new_leads.append(signal_lead)
    except Exception as e:
        logger.warning("Signal scanning failed (non-blocking): %s", e)

    # Add new leads to state (deduplicates)
    if new_leads:
        added = add_leads(new_leads)
        send_telegram_message(f"Sourced {added} new leads today.")
    else:
        send_telegram_message("No new leads sourced today — using existing pipeline.")

    # ──────────────────────────────────────────────────────────
    # Step 2: Enrich new leads
    # ──────────────────────────────────────────────────────────
    unenriched = get_leads_by_status("new")
    if unenriched:
        enriched = batch_enrich(unenriched[:10])
        for lead in enriched:
            update_lead(lead["email"], {
                "status": "enriched",
                "enrichment": lead.get("enrichment", {}),
            })
        logger.info("Enriched %d leads", len(enriched))

    # ──────────────────────────────────────────────────────────
    # Step 3: Compose email sequences for enriched leads
    # ──────────────────────────────────────────────────────────
    enriched_leads = get_leads_by_status("enriched")
    approved_emails = []

    for lead in enriched_leads[:daily_limit]:
        # 3a. Find matching candidates
        try:
            candidates = find_matching_candidates(lead, limit=3)
        except Exception as e:
            logger.warning("Candidate matching failed for %s: %s", lead["email"], e)
            candidates = []

        # 3b. Compose email sequence
        try:
            sequence = compose_sequence(lead, candidates)
        except Exception as e:
            logger.error("Email composition failed for %s: %s", lead["email"], e)
            continue

        if not sequence:
            continue

        # 3c. Compose LinkedIn messages
        linkedin_content = None
        if lead.get("linkedin_url"):
            try:
                linkedin_content = compose_linkedin_messages(lead, candidates)
            except Exception as e:
                logger.warning("LinkedIn composition failed for %s: %s", lead["email"], e)

        # 3d. Preview for approval
        preview = format_prospect_preview(lead, candidates, sequence)
        buttons = [
            {"text": "Approve & Send", "callback_data": f"outreach_approve_{lead['email']}"},
            {"text": "Skip", "callback_data": f"outreach_skip_{lead['email']}"},
        ]
        msg_id = send_message_with_inline_keyboard(preview, buttons)
        response = poll_for_callback(
            prefix="outreach_",
            timeout_minutes=60,
            message_id=msg_id,
            buttons=buttons,
        )

        if response and response.startswith("outreach_approve_"):
            # Queue first email for sending
            first_email = sequence["emails"][0]
            approved_emails.append({
                "to_email": lead["email"],
                "subject": first_email["subject"],
                "body": first_email["body"],
                "step": 1,
            })
            # Store full sequence in lead state for follow-ups
            update_lead(lead["email"], {
                "status": "queued",
                "email_sequence": sequence["emails"],
            })

            # Queue LinkedIn if available
            if linkedin_content:
                queue_linkedin_message(lead, linkedin_content)

        else:
            update_lead(lead["email"], {"status": "skipped"})
            logger.info("Skipped prospect: %s", lead["email"])

    # ──────────────────────────────────────────────────────────
    # Step 4: Send follow-ups for existing sequences
    # ──────────────────────────────────────────────────────────
    due_followups = get_due_followups()
    for lead in due_followups:
        next_step = lead.get("sequence_step", 0) + 1
        emails = lead.get("email_sequence", [])
        next_email = next(
            (e for e in emails if e.get("step") == next_step),
            None,
        )
        if next_email:
            approved_emails.append({
                "to_email": lead["email"],
                "subject": next_email["subject"],
                "body": next_email["body"],
                "step": next_step,
            })

    # ──────────────────────────────────────────────────────────
    # Step 5: Send approved emails
    # ──────────────────────────────────────────────────────────
    if approved_emails:
        send_telegram_message(
            f"Sending {len(approved_emails)} emails (limit: {daily_limit})..."
        )
        results = send_batch(approved_emails, daily_limit)
        send_telegram_message(format_batch_summary(results))
    else:
        send_telegram_message("No emails to send today.")

    # ──────────────────────────────────────────────────────────
    # Step 6: LinkedIn tasks
    # ──────────────────────────────────────────────────────────
    linkedin_count = send_daily_linkedin_tasks()
    if linkedin_count > 0:
        send_telegram_message(
            f"Sent {linkedin_count} LinkedIn tasks above. "
            "Tap 'Sent' after you send each one."
        )

    # ──────────────────────────────────────────────────────────
    # Step 7: Daily summary
    # ──────────────────────────────────────────────────────────
    increment_warmup_day()
    state = get_state()
    summary = format_daily_summary(state, daily_limit)
    send_telegram_message(summary)

    # Sync metrics to CEO dashboard
    try:
        sync_metrics_to_ceo()
    except Exception as e:
        logger.warning("CEO metrics sync failed (non-blocking): %s", e)

    logger.info("Daily outreach run complete.")


def sync_metrics_to_ceo():
    """Push Maya's outreach metrics into the CEO bot's KPI dashboard."""
    from scripts.outreach.metrics import get_current_stats
    from scripts.ceo.metrics import update_current

    stats = get_current_stats()
    update_current("outreach", "emails_sent", stats["total_sent"])
    update_current("outreach", "replies_received", stats["total_replied"])
    update_current("outreach", "reply_rate_pct", stats["reply_rate"])
    update_current("outreach", "bounces", stats["total_bounced"])
    update_current("outreach", "leads_sourced", stats["total_sourced"])

    logger.info("Synced outreach metrics to CEO dashboard")


def run_weekly_report():
    """Generate and send weekly outreach metrics report."""
    from scripts.outreach.metrics import take_weekly_snapshot, get_previous_week_snapshot
    from scripts.outreach.formatter import format_weekly_report
    from scripts.outreach.telegram import send_telegram_message

    snapshot = take_weekly_snapshot()
    previous = get_previous_week_snapshot()
    report = format_weekly_report(snapshot, previous)
    send_telegram_message(report)

    # Sync to CEO dashboard
    sync_metrics_to_ceo()


def main():
    try:
        run_daily_outreach()
    except Exception as e:
        logger.error("Maya (outreach agent) failed: %s", e, exc_info=True)
        from scripts.outreach.health import notify_failure
        notify_failure(e)
        sys.exit(1)


if __name__ == "__main__":
    main()
