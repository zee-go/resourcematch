"""Maya — Outreach agent for ResourceMatch.

Candidate recruitment mode: source Filipino professionals via LinkedIn + Reddit,
draft recruitment messages, get Telegram approval, queue for manual sending.

Activates company outreach in parallel once 5 real vetted candidates exist.

Usage:
    python -m scripts.outreach.main           # Daily run (candidate recruitment)
    python -m scripts.outreach.main --report  # Weekly report
"""

import logging
import sys

from scripts.seo.logging_setup import setup_logging

setup_logging("outreach")
logger = logging.getLogger(__name__)

# Threshold: activate company outreach after this many real vetted candidates
VETTED_CANDIDATE_THRESHOLD = 5


def _count_vetted_candidates():
    """Check how many real vetted candidates exist on the platform.

    Queries the database for candidates with vetting_score >= 70
    that are NOT the 10 seeded demo profiles.
    """
    try:
        from scripts.outreach.config import get_database_url
        import psycopg2

        conn = psycopg2.connect(get_database_url())
        cur = conn.cursor()
        # Count candidates with real vetting scores (seeded ones have score 0 or NULL)
        cur.execute("""
            SELECT COUNT(*) FROM "Candidate"
            WHERE "vettingScore" >= 70
            AND "verified" = true
        """)
        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return count
    except Exception as e:
        logger.warning("Could not count vetted candidates (defaulting to 0): %s", e)
        return 0


def run_daily():
    """Main daily flow — candidate recruitment, with optional company outreach."""
    from scripts.outreach.candidate_sourcer import get_daily_candidates
    from scripts.outreach.candidate_composer import (
        compose_linkedin_recruitment,
        compose_reddit_reply,
    )
    from scripts.outreach.formatter import (
        format_linkedin_candidate_preview,
        format_reddit_candidate_preview,
        format_candidate_daily_summary,
    )
    from scripts.outreach.state import (
        get_candidate_state,
        add_candidate_prospect,
        mark_candidate_messaged,
        get_candidate_stats,
        add_seen_reddit_url,
    )
    from scripts.outreach.activity_log import append_entry
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

    import datetime as _dt
    today = _dt.date.today()

    send_telegram_message(
        "Hey! Maya here — starting today's candidate recruitment run."
    )

    # ──────────────────────────────────────────────────────────
    # Step 0: Get weekly directive from CEO bot
    # ──────────────────────────────────────────────────────────
    directive = get_current_directive()

    if not directive or today.weekday() == 0:
        send_telegram_message("Consulting the Strategic Director for this week's plan...")
        try:
            directive = get_weekly_directive()
            preview = format_directive_for_telegram(directive)
            buttons = [
                {"text": "Approve plan", "callback_data": "outreach_plan_approve"},
                {"text": "Skip today", "callback_data": "outreach_plan_skip"},
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

    # Activity log tracking
    log_entry = {
        "directive": {
            "primary_vertical": directive.get("primary_vertical"),
            "priority_segments": directive.get("priority_segments", []),
            "source": "CEO bot weekly plan",
        },
        "linkedin": {},
        "reddit": {},
        "results": {},
    }

    # ──────────────────────────────────────────────────────────
    # Step 1: Candidate sourcing (LinkedIn + Reddit)
    # ──────────────────────────────────────────────────────────
    send_telegram_message("Sourcing candidates...")

    sourcing = get_daily_candidates(directive=directive)
    linkedin_searches = sourcing["linkedin_searches"]
    reddit_candidates = sourcing["reddit_candidates"]

    # Filter out already-seen Reddit posts
    candidate_state = get_candidate_state()
    seen_urls = set(candidate_state.get("seen_reddit_urls", []))
    reddit_candidates = [c for c in reddit_candidates if c.get("url") not in seen_urls]

    linkedin_activity = {"searches_shown": 0, "drafted": 0, "approved": 0, "queued": 0}
    reddit_activity = {"posts_found": len(reddit_candidates), "drafted": 0, "approved": 0}

    # ──────────────────────────────────────────────────────────
    # Step 2: LinkedIn — show search URLs + draft messages
    # ──────────────────────────────────────────────────────────
    if linkedin_searches:
        search_text = "[Maya] LinkedIn Searches for Today\n\n"
        for i, s in enumerate(linkedin_searches, 1):
            search_text += f"{i}. \"{s['search_query']}\"\n   {s['search_url']}\n\n"
        search_text += (
            "Open these searches on LinkedIn. For each promising profile, "
            "tap 'Draft Message' below and I'll compose a personalized pitch."
        )

        buttons = [
            {"text": "Draft messages", "callback_data": "outreach_li_draft"},
            {"text": "Skip LinkedIn", "callback_data": "outreach_li_skip"},
        ]
        msg_id = send_message_with_inline_keyboard(search_text, buttons)
        response = poll_for_callback(
            prefix="outreach_li_",
            timeout_minutes=60,
            message_id=msg_id,
            buttons=buttons,
        )

        linkedin_activity["searches_shown"] = len(linkedin_searches)
        log_entry["linkedin"]["searches"] = linkedin_searches

        if response == "outreach_li_draft":
            # Ask user to describe candidates they found
            send_telegram_message(
                "Describe the candidates you found (one per message).\n"
                "Include: name, title, and any details you see on their profile.\n\n"
                "Example: 'Maria Santos, Senior Accountant at Deloitte PH, "
                "10 years experience, CPA, QuickBooks expert'\n\n"
                "Type 'done' when finished."
            )

            from scripts.outreach.telegram import poll_for_text_reply

            candidates_described = []
            while True:
                reply = poll_for_text_reply(timeout_minutes=30)
                if not reply or reply.lower().strip() == "done":
                    break
                candidates_described.append(reply.strip())

            # Compose messages for each described candidate
            for desc in candidates_described:
                candidate_context = {
                    "name": desc.split(",")[0].strip() if "," in desc else desc[:50],
                    "description": desc,
                    "vertical": directive.get("primary_vertical", "accounting"),
                }

                messages = compose_linkedin_recruitment(
                    candidate_context,
                    vertical=directive.get("primary_vertical", "accounting"),
                )

                if not messages:
                    continue

                linkedin_activity["drafted"] += 1

                # Preview for approval
                preview = format_linkedin_candidate_preview(
                    linkedin_searches[0]["search_query"] if linkedin_searches else "",
                    candidate_context,
                    messages,
                )
                buttons = [
                    {"text": "Approve", "callback_data": "outreach_cand_approve"},
                    {"text": "Skip", "callback_data": "outreach_cand_skip"},
                ]
                msg_id = send_message_with_inline_keyboard(preview, buttons)
                response = poll_for_callback(
                    prefix="outreach_cand_",
                    timeout_minutes=30,
                    message_id=msg_id,
                    buttons=buttons,
                )

                if response == "outreach_cand_approve":
                    linkedin_activity["approved"] += 1
                    # Queue for manual sending via LinkedIn
                    from scripts.outreach.linkedin_queue import queue_linkedin_message
                    queue_linkedin_message(
                        {"name": candidate_context["name"], "email": "", "title": "", "company_name": ""},
                        messages,
                    )
                    linkedin_activity["queued"] += 1
                    add_candidate_prospect({
                        "source": "linkedin",
                        "name": candidate_context["name"],
                        "description": desc,
                        "vertical": candidate_context["vertical"],
                        "messages": messages,
                    })

    # ──────────────────────────────────────────────────────────
    # Step 3: Reddit — preview candidates + draft replies
    # ──────────────────────────────────────────────────────────
    if reddit_candidates:
        send_telegram_message(
            f"Found {len(reddit_candidates)} candidate signals on Reddit."
        )

        for post in reddit_candidates[:5]:  # Cap at 5 per day
            add_seen_reddit_url(post.get("url", ""))

            messages = compose_reddit_reply(
                post,
                vertical=directive.get("primary_vertical", "accounting"),
            )

            if not messages:
                continue

            reddit_activity["drafted"] += 1

            preview = format_reddit_candidate_preview(post, messages)
            buttons = [
                {"text": "Approve", "callback_data": "outreach_reddit_approve"},
                {"text": "Skip", "callback_data": "outreach_reddit_skip"},
            ]
            msg_id = send_message_with_inline_keyboard(preview, buttons)
            response = poll_for_callback(
                prefix="outreach_reddit_",
                timeout_minutes=30,
                message_id=msg_id,
                buttons=buttons,
            )

            if response == "outreach_reddit_approve":
                reddit_activity["approved"] += 1
                add_candidate_prospect({
                    "source": "reddit",
                    "author": post.get("author", ""),
                    "url": post.get("url", ""),
                    "subreddit": post.get("subreddit", ""),
                    "vertical": post.get("vertical", "general"),
                    "messages": messages,
                })
    else:
        send_telegram_message("No new Reddit candidate signals today.")

    # ──────────────────────────────────────────────────────────
    # Step 4: LinkedIn manual sending tasks
    # ──────────────────────────────────────────────────────────
    from scripts.outreach.linkedin_queue import send_daily_linkedin_tasks
    linkedin_count = send_daily_linkedin_tasks()
    if linkedin_count > 0:
        send_telegram_message(
            f"Sent {linkedin_count} LinkedIn tasks above. "
            "Tap 'Sent' after you send each one."
        )

    # ──────────────────────────────────────────────────────────
    # Step 5: Check if company outreach should activate
    # ──────────────────────────────────────────────────────────
    vetted_count = _count_vetted_candidates()
    if vetted_count >= VETTED_CANDIDATE_THRESHOLD:
        send_telegram_message(
            f"We have {vetted_count} vetted candidates! "
            "Company outreach is now eligible. Running company pipeline..."
        )
        try:
            _run_company_outreach(directive)
            log_entry["company_outreach"] = {"active": True}
        except Exception as e:
            logger.error("Company outreach failed: %s", e)
            send_telegram_message(f"Company outreach error: {e}")
    else:
        remaining = VETTED_CANDIDATE_THRESHOLD - vetted_count
        send_telegram_message(
            f"Vetted candidates: {vetted_count}/{VETTED_CANDIDATE_THRESHOLD}. "
            f"Need {remaining} more before activating company outreach."
        )

    # ──────────────────────────────────────────────────────────
    # Step 6: Daily summary + activity log
    # ──────────────────────────────────────────────────────────
    candidate_stats = get_candidate_stats()

    summary = format_candidate_daily_summary(
        candidate_stats, linkedin_activity, reddit_activity,
    )
    send_telegram_message(summary)

    # Update log entry
    log_entry["linkedin"].update({
        "profiles_found": linkedin_activity.get("drafted", 0),
        "messages_drafted": linkedin_activity.get("drafted", 0),
        "messages_approved": linkedin_activity.get("approved", 0),
        "queued": linkedin_activity.get("queued", 0),
    })
    log_entry["reddit"].update({
        "subreddits_scanned": list({c.get("subreddit", "") for c in reddit_candidates}),
        "posts_found": reddit_activity.get("posts_found", 0),
        "messages_drafted": reddit_activity.get("drafted", 0),
        "messages_approved": reddit_activity.get("approved", 0),
    })
    log_entry["results"] = {
        "linkedin_messages_queued": linkedin_activity.get("queued", 0),
        "reddit_replies_approved": reddit_activity.get("approved", 0),
        "vetted_candidates": vetted_count,
        "company_outreach_active": vetted_count >= VETTED_CANDIDATE_THRESHOLD,
    }

    append_entry(log_entry)

    # Sync metrics to CEO dashboard
    try:
        sync_metrics_to_ceo()
    except Exception as e:
        logger.warning("CEO metrics sync failed (non-blocking): %s", e)

    logger.info("Daily outreach run complete.")


def _run_company_outreach(directive):
    """Run the company outreach pipeline (activated after 5 vetted candidates)."""
    from scripts.outreach.lead_sourcer import get_daily_leads
    from scripts.outreach.signal_scanner import get_daily_signals
    from scripts.outreach.lead_enricher import batch_enrich
    from scripts.outreach.candidate_matcher import find_matching_candidates
    from scripts.outreach.email_composer import compose_sequence
    from scripts.outreach.linkedin_composer import compose_linkedin_messages
    from scripts.outreach.email_sender import send_batch
    from scripts.outreach.linkedin_queue import queue_linkedin_message
    from scripts.outreach.formatter import format_prospect_preview, format_batch_summary
    from scripts.outreach.state import (
        add_leads, get_leads_by_status, update_lead, get_state,
        get_warmup_day, increment_warmup_day, get_due_followups,
    )
    from scripts.outreach.telegram import (
        send_telegram_message, send_message_with_inline_keyboard, poll_for_callback,
    )

    daily_limit = get_warmup_day()
    send_telegram_message(
        f"Company outreach active. Warmup: {daily_limit} emails/day."
    )

    # Source leads
    new_leads = []
    try:
        apollo_leads = get_daily_leads(max_credits=3)
        new_leads.extend(apollo_leads)
    except Exception as e:
        logger.warning("Apollo sourcing failed: %s", e)

    try:
        signals = get_daily_signals()
        for signal in signals[:10]:
            signal_lead = {
                "name": "", "first_name": "", "last_name": "",
                "email": "", "title": "",
                "company_name": signal["company_name"],
                "company_website": "", "segment": "signal",
                "source": signal["source"], "signal_data": signal,
            }
            if signal_lead.get("email"):
                new_leads.append(signal_lead)
    except Exception as e:
        logger.warning("Signal scanning failed: %s", e)

    if new_leads:
        added = add_leads(new_leads)
        send_telegram_message(f"Sourced {added} new company leads.")

    # Enrich
    unenriched = get_leads_by_status("new")
    if unenriched:
        enriched = batch_enrich(unenriched[:10])
        for lead in enriched:
            update_lead(lead["email"], {
                "status": "enriched",
                "enrichment": lead.get("enrichment", {}),
            })

    # Compose + approve
    enriched_leads = get_leads_by_status("enriched")
    approved_emails = []

    for lead in enriched_leads[:daily_limit]:
        try:
            candidates = find_matching_candidates(lead, limit=3)
        except Exception:
            candidates = []

        try:
            sequence = compose_sequence(lead, candidates)
        except Exception:
            continue

        if not sequence:
            continue

        linkedin_content = None
        if lead.get("linkedin_url"):
            try:
                linkedin_content = compose_linkedin_messages(lead, candidates)
            except Exception:
                pass

        preview = format_prospect_preview(lead, candidates, sequence)
        buttons = [
            {"text": "Approve & Send", "callback_data": f"outreach_approve_{lead['email']}"},
            {"text": "Skip", "callback_data": f"outreach_skip_{lead['email']}"},
        ]
        msg_id = send_message_with_inline_keyboard(preview, buttons)
        response = poll_for_callback(
            prefix="outreach_", timeout_minutes=60,
            message_id=msg_id, buttons=buttons,
        )

        if response and response.startswith("outreach_approve_"):
            first_email = sequence["emails"][0]
            approved_emails.append({
                "to_email": lead["email"],
                "subject": first_email["subject"],
                "body": first_email["body"],
                "step": 1,
            })
            update_lead(lead["email"], {
                "status": "queued",
                "email_sequence": sequence["emails"],
            })
            if linkedin_content:
                queue_linkedin_message(lead, linkedin_content)
        else:
            update_lead(lead["email"], {"status": "skipped"})

    # Follow-ups
    for lead in get_due_followups():
        next_step = lead.get("sequence_step", 0) + 1
        emails = lead.get("email_sequence", [])
        next_email = next((e for e in emails if e.get("step") == next_step), None)
        if next_email:
            approved_emails.append({
                "to_email": lead["email"],
                "subject": next_email["subject"],
                "body": next_email["body"],
                "step": next_step,
            })

    # Send
    if approved_emails:
        results = send_batch(approved_emails, daily_limit)
        send_telegram_message(format_batch_summary(results))

    increment_warmup_day()


def sync_metrics_to_ceo():
    """Push Maya's outreach metrics into the CEO bot's KPI dashboard."""
    from scripts.outreach.metrics import get_current_stats
    from scripts.outreach.state import get_candidate_stats
    from scripts.ceo.metrics import update_current

    stats = get_current_stats()
    update_current("outreach", "emails_sent", stats["total_sent"])
    update_current("outreach", "replies_received", stats["total_replied"])
    update_current("outreach", "reply_rate_pct", stats["reply_rate"])
    update_current("outreach", "bounces", stats["total_bounced"])
    update_current("outreach", "leads_sourced", stats["total_sourced"])

    # Supply-side metrics
    cand_stats = get_candidate_stats()
    update_current("outreach", "candidate_messages_sent", cand_stats["total_messaged"])
    update_current("outreach", "candidate_responses", cand_stats["total_responded"])
    update_current("outreach", "applications_via_outreach", cand_stats["total_applied"])

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
    sync_metrics_to_ceo()


def main():
    args = sys.argv[1:]

    if args and args[0] == "--report":
        run_weekly_report()
        return

    try:
        run_daily()
    except Exception as e:
        logger.error("Maya (outreach agent) failed: %s", e, exc_info=True)
        from scripts.outreach.health import notify_failure
        notify_failure(e)
        sys.exit(1)


if __name__ == "__main__":
    main()
