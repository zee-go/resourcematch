"""Kelly — SEO content agent for resourcematch.ph.

Weekly content planning, generation, and publishing.
Accessible as 'Kelly' in conversation.
"""

import logging
import sys

from scripts.seo.logging_setup import setup_logging
setup_logging("seo")
logger = logging.getLogger(__name__)


def run_weekly_content():
    """Main weekly flow: plan -> generate -> preview -> approve -> publish."""
    from scripts.seo.content_planner import generate_weekly_plan
    from scripts.seo.content_generator import generate_blog_post, generate_landing_page
    from scripts.seo.page_writer import write_blog_post, write_landing_page
    from scripts.seo.publisher import publish_page
    from scripts.seo.state import record_publication, get_state, save_calendar
    from scripts.seo.formatter import (
        format_weekly_plan,
        format_content_preview,
        format_publish_confirmation,
        format_weekly_summary,
        format_traffic_report,
        format_no_traffic_data,
    )
    from scripts.seo.telegram import (
        send_telegram_message,
        send_message_with_inline_keyboard,
        poll_for_callback,
    )

    send_telegram_message("Hey! Kelly here — starting this week's ResourceMatch content run...")

    # Step 0: Weekly traffic report (non-blocking)
    try:
        from scripts.seo.search_console import get_weekly_traffic_report
        from scripts.seo.traffic_tracker import save_traffic_snapshot, get_previous_snapshot

        report = get_weekly_traffic_report()
        if report is not None:
            previous = get_previous_snapshot()
            send_telegram_message(format_traffic_report(report, previous))
            save_traffic_snapshot(report)
        else:
            send_telegram_message(format_no_traffic_data())
    except Exception as e:
        logger.warning("Traffic report failed (non-blocking): %s", e)
        send_telegram_message(format_no_traffic_data())

    # Step 1: Generate or retrieve weekly plan
    calendar = generate_weekly_plan()

    plan_preview = format_weekly_plan(calendar)
    buttons = [
        {"text": "Looks good, start writing", "callback_data": "seo_plan_approve"},
        {"text": "Skip this week", "callback_data": "seo_plan_skip"},
    ]
    msg_id = send_message_with_inline_keyboard(plan_preview, buttons)
    response = poll_for_callback(
        prefix="seo_plan_", timeout_minutes=120,
        message_id=msg_id, buttons=buttons,
    )

    if response != "seo_plan_approve":
        send_telegram_message("Got it — Kelly's taking the week off. See you next Monday!")
        logger.info("User skipped weekly SEO plan.")
        return

    # Step 2: Generate and publish each content piece
    published_count = 0
    for i, item in enumerate(calendar.get("items", []), 1):
        if item.get("status") == "published":
            continue

        send_telegram_message(
            f"Writing piece {i}/{len(calendar['items'])}: {item['title_suggestion']}..."
        )

        try:
            page_type = item.get("page_type", "blog")
            is_landing = page_type == "landing"

            if is_landing:
                content = generate_landing_page(item)
            else:
                content = generate_blog_post(item)

            # Source images (non-blocking)
            images = None
            try:
                from scripts.seo.image_client import source_images_for_post
                images = source_images_for_post(
                    slug=content["slug"],
                    title=content["title"],
                    primary_keyword=item["primary_keyword"],
                    secondary_keywords=item.get("secondary_keywords"),
                )
            except Exception as img_err:
                logger.warning("Image sourcing failed, continuing without: %s", img_err)

            if is_landing:
                file_path = write_landing_page(content, images=images)
            else:
                file_path = write_blog_post(content, images=images)

            # Preview for approval — loop up to 3 regenerations
            approved = False
            for attempt in range(3):
                preview = format_content_preview(content, page_type)
                buttons = [
                    {"text": "Publish", "callback_data": "seo_content_approve"},
                    {"text": "Regenerate", "callback_data": "seo_content_regenerate"},
                    {"text": "Skip this one", "callback_data": "seo_content_skip"},
                ]
                msg_id = send_message_with_inline_keyboard(preview, buttons)
                response = poll_for_callback(
                    prefix="seo_content_", timeout_minutes=60,
                    message_id=msg_id, buttons=buttons,
                )

                if response == "seo_content_approve":
                    approved = True
                    break
                elif response == "seo_content_regenerate":
                    logger.info("Regenerating content (attempt %d).", attempt + 2)
                    if is_landing:
                        content = generate_landing_page(item)
                    else:
                        content = generate_blog_post(item)
                    images = None
                    try:
                        from scripts.seo.image_client import source_images_for_post
                        images = source_images_for_post(
                            slug=content["slug"],
                            title=content["title"],
                            primary_keyword=item["primary_keyword"],
                            secondary_keywords=item.get("secondary_keywords"),
                        )
                    except Exception as img_err:
                        logger.warning("Image sourcing failed on regen: %s", img_err)
                    if is_landing:
                        file_path = write_landing_page(content, images=images)
                    else:
                        file_path = write_blog_post(content, images=images)
                elif response in (None, "seo_content_skip"):
                    send_telegram_message(f"Skipped: {item['title_suggestion']}")
                    break

            if not approved:
                continue

            # Publish: git commit + push
            commit_hash = publish_page(
                file_path,
                content["title"],
                page_type=page_type,
                slug=content.get("slug"),
            )

            record_publication(
                page_type="blog",
                slug=content["slug"],
                title=content["title"],
                keywords=content.get("keywords", []),
                category=content.get("category", ""),
                target_market=content.get("target_market", "universal"),
            )

            item["status"] = "published"
            save_calendar(calendar)

            confirmation = format_publish_confirmation(
                content["title"], content["slug"], "blog", commit_hash,
            )
            send_telegram_message(confirmation)
            published_count += 1

        except Exception as e:
            logger.error("Failed to process item %d: %s", i, e, exc_info=True)
            send_telegram_message(f"Error on item {i}: {e}")

    # Step 3: Weekly summary
    state = get_state()
    summary = format_weekly_summary(state)
    send_telegram_message(
        f"Kelly's done! Published {published_count} posts this week.\n\n{summary}"
    )


def main():
    try:
        run_weekly_content()
    except Exception as e:
        logger.error("Kelly (SEO agent) failed: %s", e, exc_info=True)
        from scripts.seo.health import notify_failure
        notify_failure("Kelly (SEO/ResourceMatch)", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
