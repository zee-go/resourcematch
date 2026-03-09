"""Health monitoring — Telegram alert on Maya (outreach agent) failure."""

import logging
import traceback

logger = logging.getLogger(__name__)


def notify_failure(error):
    """Send a Telegram alert when the outreach agent crashes."""
    try:
        from scripts.outreach.telegram import send_telegram_message

        tb = traceback.format_exception_only(type(error), error)
        error_text = "".join(tb).strip()
        send_telegram_message(f"[Maya] crashed: {error_text}")
    except Exception as notify_err:
        logger.error("Failed to send failure notification: %s", notify_err)
