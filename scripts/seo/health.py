"""Health monitoring — Telegram alert on agent failure."""

import logging
import traceback

logger = logging.getLogger(__name__)


def notify_failure(agent_name, error):
    """Send a Telegram alert when an agent crashes."""
    try:
        from scripts.seo.config import _get_secret
        from scripts.seo.telegram_client import TelegramClient

        token = _get_secret("seo-telegram-bot-token")
        chat_id = _get_secret("seo-telegram-chat-id")
        client = TelegramClient(token, chat_id)

        tb = traceback.format_exception_only(type(error), error)
        error_text = "".join(tb).strip()
        client.send_message(f"[{agent_name}] crashed: {error_text}")
    except Exception as notify_err:
        logger.error("Failed to send failure notification: %s", notify_err)
