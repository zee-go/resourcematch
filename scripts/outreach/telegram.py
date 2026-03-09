"""Telegram client for the outreach agent (Maya).

Reuses the same Telegram bot as Kelly (SEO agent), with 'outreach_' callback prefixes.
"""

from scripts.seo.config import _get_secret
from scripts.seo.telegram_client import TelegramClient

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = TelegramClient(
            _get_secret("seo-telegram-bot-token"),
            _get_secret("seo-telegram-chat-id"),
        )
    return _client


def send_telegram_message(text):
    """Send a text message via the outreach Telegram bot. Returns True on success."""
    return _get_client().send_message(text)


def send_message_with_inline_keyboard(text, buttons):
    """Send a message with inline keyboard buttons. Returns the message_id."""
    return _get_client().send_message_with_inline_keyboard(text, buttons)


def poll_for_callback(prefix="outreach_", timeout_minutes=120, poll_interval=5,
                      message_id=None, buttons=None):
    """Poll for inline keyboard callback matching the given prefix."""
    return _get_client().poll_for_callback(
        prefix=prefix,
        timeout_minutes=timeout_minutes,
        poll_interval=poll_interval,
        message_id=message_id,
        buttons=buttons,
    )


def poll_for_text_reply(timeout_minutes=30, poll_interval=5):
    """Poll for a text message reply from the user."""
    return _get_client().poll_for_text_reply(
        timeout_minutes=timeout_minutes,
        poll_interval=poll_interval,
    )
