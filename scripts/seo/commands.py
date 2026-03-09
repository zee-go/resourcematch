"""Command handlers for the Kelly SEO Bot.

Each command function receives an args string (everything after the command name).
Long-running commands use bot.run_in_background() to avoid blocking the poll loop.
"""

import logging

logger = logging.getLogger(__name__)

# Pending callback handlers: maps callback_data prefix -> handler function
_pending_callbacks = {}


def _register_callback(prefix, handler):
    """Register a callback handler for inline keyboard buttons."""
    _pending_callbacks[prefix] = handler


def handle_callback(callback):
    """Route a callback query to the registered handler."""
    data = callback.get("data", "")
    message_id = callback.get("message", {}).get("message_id")

    for prefix, handler in list(_pending_callbacks.items()):
        if data.startswith(prefix):
            try:
                handler(data, callback)
            except Exception as e:
                logger.error("Callback handler error for %s: %s", prefix, e, exc_info=True)
                from scripts.seo.bot import send
                send(f"Error: {e}")
            return


# ---------------------------------------------------------------------------
# /help, /start
# ---------------------------------------------------------------------------

def cmd_help(args):
    from scripts.seo.bot import send
    send(
        "Kelly SEO Bot\n\n"
        "Commands:\n"
        "/traffic - Weekly traffic report from GSC\n"
        "/plan - Generate this week's content plan\n"
        "/write [topic] - Generate a blog post (optional topic)\n"
        "/research - Research topic ideas\n"
        "/publish - Publish last generated post\n"
        "/status - Current SEO state and stats\n"
        "/run - Run full weekly workflow\n"
        "/help - Show this message\n\n"
        "Or just type a question about SEO and I'll answer."
    )


# ---------------------------------------------------------------------------
# /status
# ---------------------------------------------------------------------------

def cmd_status(args):
    from scripts.seo.bot import send
    from scripts.seo.state import get_state
    from scripts.seo.formatter import format_weekly_summary

    state = get_state()
    send(format_weekly_summary(state))


# ---------------------------------------------------------------------------
# /traffic
# ---------------------------------------------------------------------------

def cmd_traffic(args):
    from scripts.seo.bot import send, run_in_background

    if not run_in_background("traffic report", _do_traffic):
        send("Another task is running. Try again shortly.")
        return
    send("Fetching traffic data from Search Console...")


def _do_traffic():
    from scripts.seo.bot import send
    from scripts.seo.search_console import get_weekly_traffic_report
    from scripts.seo.traffic_tracker import get_previous_snapshot
    from scripts.seo.formatter import format_traffic_report, format_no_traffic_data

    report = get_weekly_traffic_report()
    if report is not None:
        previous = get_previous_snapshot()
        send(format_traffic_report(report, previous))
    else:
        send(format_no_traffic_data())


# ---------------------------------------------------------------------------
# /plan
# ---------------------------------------------------------------------------

def cmd_plan(args):
    from scripts.seo.bot import send, run_in_background

    if not run_in_background("content plan", _do_plan):
        send("Another task is running. Try again shortly.")
        return
    send("Generating content plan (researching topics with Claude)...")


def _do_plan():
    from scripts.seo.bot import send, send_with_buttons
    from scripts.seo.content_planner import generate_weekly_plan
    from scripts.seo.formatter import format_weekly_plan

    calendar = generate_weekly_plan()
    preview = format_weekly_plan(calendar)
    buttons = [
        {"text": "Looks good, start writing", "callback_data": "bot_plan_approve"},
        {"text": "Regenerate plan", "callback_data": "bot_plan_regen"},
    ]
    send_with_buttons(preview, buttons)
    _register_callback("bot_plan_", _handle_plan_callback)


def _handle_plan_callback(data, callback):
    from scripts.seo.bot import send

    if data == "bot_plan_approve":
        send("Plan approved. Use /write to generate articles, or /run to run the full workflow.")
    elif data == "bot_plan_regen":
        from scripts.seo.state import save_calendar
        save_calendar({})
        send("Cleared plan. Regenerating...")
        cmd_plan("")


# ---------------------------------------------------------------------------
# /research
# ---------------------------------------------------------------------------

def cmd_research(args):
    from scripts.seo.bot import send, run_in_background

    if not run_in_background("topic research", _do_research):
        send("Another task is running. Try again shortly.")
        return
    send("Researching topics with Claude...")


def _do_research():
    from scripts.seo.bot import send
    from scripts.seo.topic_researcher import research_topics

    topics = research_topics(count=5)

    lines = ["Topic Research Results\n"]
    for i, t in enumerate(topics, 1):
        lines.append(
            f"{i}. {t['title_suggestion']}\n"
            f"   Keyword: {t['primary_keyword']}\n"
            f"   Pillar: {t['pillar']}\n"
            f"   Rationale: {t['rationale']}\n"
        )
    send("\n".join(lines))


# ---------------------------------------------------------------------------
# /write [topic]
# ---------------------------------------------------------------------------

# Module-level state for the write/publish flow
_write_state = {}


def cmd_write(args):
    from scripts.seo.bot import send, run_in_background

    if not run_in_background("write article", _do_write, args):
        send("Another task is running. Try again shortly.")
        return
    if args:
        send(f"Writing a blog post about: {args}\nThis takes 1-2 minutes...")
    else:
        send("Generating a blog post from the current plan...\nThis takes 1-2 minutes...")


def _do_write(topic_arg):
    from scripts.seo.bot import send, send_with_buttons
    from scripts.seo.content_generator import generate_blog_post
    from scripts.seo.page_writer import write_blog_post
    from scripts.seo.image_client import source_images_for_post
    from scripts.seo.state import get_calendar
    from scripts.seo.formatter import format_content_preview

    if topic_arg:
        # Ad-hoc topic: construct a minimal topic_plan dict
        topic_plan = {
            "topic": topic_arg,
            "primary_keyword": topic_arg.lower(),
            "secondary_keywords": [],
            "search_intent": "informational",
            "pillar": "outsourcing_strategy",
            "title_suggestion": topic_arg,
            "meta_description": f"Expert guide on {topic_arg} for ResourceMatch.",
            "page_type": "blog",
        }
    else:
        calendar = get_calendar()
        items = calendar.get("items", [])
        pending = [i for i in items if i.get("status") != "published"]
        if not pending:
            send("No pending items in the plan. Use /plan to create one, or /write [topic].")
            return
        topic_plan = pending[0]

    content = generate_blog_post(topic_plan)

    # Source images (non-blocking)
    images = None
    try:
        images = source_images_for_post(
            slug=content["slug"],
            title=content["title"],
            primary_keyword=topic_plan["primary_keyword"],
            secondary_keywords=topic_plan.get("secondary_keywords"),
        )
    except Exception as e:
        logger.warning("Image sourcing failed: %s", e)

    file_path = write_blog_post(content, images=images)

    _write_state["last_content"] = content
    _write_state["last_file_path"] = file_path
    _write_state["last_topic_plan"] = topic_plan
    _write_state["last_images"] = images

    preview = format_content_preview(content, "blog")
    buttons = [
        {"text": "Publish", "callback_data": "bot_write_publish"},
        {"text": "Regenerate", "callback_data": "bot_write_regen"},
        {"text": "Discard", "callback_data": "bot_write_discard"},
    ]
    send_with_buttons(preview, buttons)
    _register_callback("bot_write_", _handle_write_callback)


def _handle_write_callback(data, callback):
    from scripts.seo.bot import send, run_in_background

    if data == "bot_write_publish":
        content = _write_state.get("last_content")
        file_path = _write_state.get("last_file_path")
        if not content or not file_path:
            send("Nothing to publish. Use /write first.")
            return
        if not run_in_background("publish", _do_publish, content, file_path):
            send("Another task is running. Try again shortly.")
            return
        send("Publishing...")

    elif data == "bot_write_regen":
        topic_plan = _write_state.get("last_topic_plan")
        if not topic_plan:
            send("No topic to regenerate. Use /write.")
            return
        topic_arg = topic_plan.get("topic", "")
        if not run_in_background("regenerate article", _do_write, topic_arg):
            send("Another task is running. Try again shortly.")
            return
        send("Regenerating article...")

    elif data == "bot_write_discard":
        _write_state.clear()
        send("Discarded. Use /write to start fresh.")


def _do_publish(content, file_path):
    from scripts.seo.bot import send
    from scripts.seo.publisher import publish_page
    from scripts.seo.state import record_publication, get_calendar, save_calendar
    from scripts.seo.formatter import format_publish_confirmation

    commit_hash = publish_page(
        file_path, content["title"], page_type="blog", slug=content.get("slug"),
    )

    record_publication(
        page_type="blog",
        slug=content["slug"],
        title=content["title"],
        keywords=content.get("keywords", []),
        category=content.get("category", ""),
    )

    # Mark calendar item as published if it matches
    calendar = get_calendar()
    for item in calendar.get("items", []):
        if item.get("primary_keyword") == content.get("keywords", [None])[0]:
            item["status"] = "published"
    save_calendar(calendar)

    confirmation = format_publish_confirmation(
        content["title"], content["slug"], "blog", commit_hash,
    )
    send(confirmation)
    _write_state.clear()


# ---------------------------------------------------------------------------
# /publish
# ---------------------------------------------------------------------------

def cmd_publish(args):
    from scripts.seo.bot import send, run_in_background

    content = _write_state.get("last_content")
    file_path = _write_state.get("last_file_path")
    if not content or not file_path:
        send("Nothing to publish. Generate content with /write first.")
        return

    if not run_in_background("publish", _do_publish, content, file_path):
        send("Another task is running. Try again shortly.")
        return
    send("Publishing...")


# ---------------------------------------------------------------------------
# /run — Full weekly workflow (state machine)
# ---------------------------------------------------------------------------

_run_state = {}


def cmd_run(args):
    from scripts.seo.bot import send, run_in_background

    if not run_in_background("full weekly run", _do_run_start):
        send("Another task is running. Try again shortly.")
        return
    send("Starting full weekly content run...")


def _do_run_start():
    """Phase 1: traffic report + plan generation."""
    from scripts.seo.bot import send, send_with_buttons
    from scripts.seo.content_planner import generate_weekly_plan
    from scripts.seo.formatter import (
        format_traffic_report, format_no_traffic_data, format_weekly_plan,
    )

    # Traffic report (best-effort)
    try:
        from scripts.seo.search_console import get_weekly_traffic_report
        from scripts.seo.traffic_tracker import save_traffic_snapshot, get_previous_snapshot

        report = get_weekly_traffic_report()
        if report is not None:
            previous = get_previous_snapshot()
            send(format_traffic_report(report, previous))
            save_traffic_snapshot(report)
        else:
            send(format_no_traffic_data())
    except Exception as e:
        logger.warning("Traffic report failed: %s", e)
        send(format_no_traffic_data())

    # Generate plan
    calendar = generate_weekly_plan()
    _run_state["calendar"] = calendar
    _run_state["current_item_index"] = 0
    _run_state["published_count"] = 0

    preview = format_weekly_plan(calendar)
    buttons = [
        {"text": "Looks good, start writing", "callback_data": "bot_run_plan_approve"},
        {"text": "Skip this week", "callback_data": "bot_run_plan_skip"},
    ]
    send_with_buttons(preview, buttons)
    _register_callback("bot_run_plan_", _handle_run_plan_callback)
    # Executor freed — waiting for user callback


def _handle_run_plan_callback(data, callback):
    from scripts.seo.bot import send, run_in_background

    if data == "bot_run_plan_skip":
        send("Got it — Kelly's taking the week off. See you next Monday!")
        _run_state.clear()
        return

    if data == "bot_run_plan_approve":
        if not run_in_background("weekly run: writing", _do_run_next_item):
            send("Another task is running. Try again shortly.")


def _do_run_next_item():
    """Generate content for the next unwritten plan item."""
    from scripts.seo.bot import send, send_with_buttons
    from scripts.seo.content_generator import generate_blog_post
    from scripts.seo.page_writer import write_blog_post
    from scripts.seo.image_client import source_images_for_post
    from scripts.seo.state import get_state
    from scripts.seo.formatter import format_content_preview, format_weekly_summary

    calendar = _run_state.get("calendar", {})
    items = calendar.get("items", [])
    idx = _run_state.get("current_item_index", 0)

    # Skip already-published items
    while idx < len(items) and items[idx].get("status") == "published":
        idx += 1

    if idx >= len(items):
        # All done
        state = get_state()
        count = _run_state.get("published_count", 0)
        summary = format_weekly_summary(state)
        send(f"Kelly's done! Published {count} post(s) this week.\n\n{summary}")
        _run_state.clear()
        return

    item = items[idx]
    _run_state["current_item_index"] = idx

    send(f"Writing {idx + 1}/{len(items)}: {item['title_suggestion']}...")

    content = generate_blog_post(item)

    images = None
    try:
        images = source_images_for_post(
            slug=content["slug"],
            title=content["title"],
            primary_keyword=item["primary_keyword"],
            secondary_keywords=item.get("secondary_keywords"),
        )
    except Exception:
        pass

    file_path = write_blog_post(content, images=images)

    _run_state["last_content"] = content
    _run_state["last_file_path"] = file_path

    preview = format_content_preview(content, "blog")
    buttons = [
        {"text": "Publish", "callback_data": "bot_run_content_approve"},
        {"text": "Regenerate", "callback_data": "bot_run_content_regen"},
        {"text": "Skip this one", "callback_data": "bot_run_content_skip"},
    ]
    send_with_buttons(preview, buttons)
    _register_callback("bot_run_content_", _handle_run_content_callback)
    # Executor freed — waiting for user callback


def _handle_run_content_callback(data, callback):
    from scripts.seo.bot import send, run_in_background

    if data == "bot_run_content_approve":
        if not run_in_background("weekly run: publishing", _do_run_publish_and_next):
            send("Another task is running. Try again shortly.")

    elif data == "bot_run_content_regen":
        send("Regenerating...")
        if not run_in_background("weekly run: regenerate", _do_run_next_item):
            send("Another task is running. Try again shortly.")

    elif data == "bot_run_content_skip":
        send("Skipped.")
        _run_state["current_item_index"] = _run_state.get("current_item_index", 0) + 1
        if not run_in_background("weekly run: next item", _do_run_next_item):
            send("Another task is running. Try again shortly.")


def _do_run_publish_and_next():
    """Publish the current item, then move to the next."""
    from scripts.seo.bot import send
    from scripts.seo.publisher import publish_page
    from scripts.seo.state import record_publication, save_calendar
    from scripts.seo.formatter import format_publish_confirmation

    content = _run_state["last_content"]
    file_path = _run_state["last_file_path"]
    calendar = _run_state["calendar"]

    commit_hash = publish_page(
        file_path, content["title"], page_type="blog", slug=content.get("slug"),
    )

    record_publication(
        page_type="blog",
        slug=content["slug"],
        title=content["title"],
        keywords=content.get("keywords", []),
        category=content.get("category", ""),
    )

    idx = _run_state["current_item_index"]
    calendar["items"][idx]["status"] = "published"
    save_calendar(calendar)

    confirmation = format_publish_confirmation(
        content["title"], content["slug"], "blog", commit_hash,
    )
    send(confirmation)

    _run_state["published_count"] = _run_state.get("published_count", 0) + 1
    _run_state["current_item_index"] = idx + 1

    # Continue to next item (runs in same executor thread)
    _do_run_next_item()


# ---------------------------------------------------------------------------
# Command registry
# ---------------------------------------------------------------------------

COMMAND_HANDLERS = {
    "/help": cmd_help,
    "/start": cmd_help,
    "/traffic": cmd_traffic,
    "/plan": cmd_plan,
    "/write": cmd_write,
    "/research": cmd_research,
    "/publish": cmd_publish,
    "/status": cmd_status,
    "/run": cmd_run,
}
