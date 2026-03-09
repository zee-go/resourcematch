"""In-process scheduler for the weekly SEO workflow.

Replaces the separate launchd cron plist for Monday 11AM runs.
Runs as a daemon thread inside the bot process.
"""

import datetime
import logging
import threading

logger = logging.getLogger(__name__)

SCHEDULE_DAY = 0     # Monday (0=Monday in weekday())
SCHEDULE_HOUR = 11   # 11:00 AM local
SCHEDULE_MINUTE = 0


def start_scheduler(shutdown_event):
    """Start the scheduler thread. Checks every 30 seconds."""
    t = threading.Thread(target=_scheduler_loop, args=(shutdown_event,), daemon=True)
    t.start()
    logger.info(
        "Scheduler started (Monday %02d:%02d)",
        SCHEDULE_HOUR, SCHEDULE_MINUTE,
    )


def _scheduler_loop(shutdown_event):
    last_triggered_date = None

    while not shutdown_event.is_set():
        now = datetime.datetime.now()

        if (
            now.weekday() == SCHEDULE_DAY
            and now.hour == SCHEDULE_HOUR
            and now.minute == SCHEDULE_MINUTE
            and now.date() != last_triggered_date
        ):
            logger.info("Scheduled weekly run triggered.")
            last_triggered_date = now.date()

            try:
                from scripts.seo.commands import cmd_run
                cmd_run("")
            except Exception as e:
                logger.error("Scheduled run failed: %s", e, exc_info=True)

        # Check every 30 seconds (sufficient for minute-level granularity)
        shutdown_event.wait(30)
