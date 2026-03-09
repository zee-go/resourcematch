"""Kelly SEO Bot — always-on interactive Telegram bot for ResourceMatch SEO.

Usage:
    python -m scripts.seo.bot          # Start the bot (foreground)
    Via launchd plist                   # Always-on daemon
"""

import json
import logging
import signal
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import requests

from scripts.seo.logging_setup import setup_logging
from scripts.seo.config import _get_secret

setup_logging("seo-bot")
logger = logging.getLogger(__name__)

# Single-worker executor — prevents parallel git conflicts and Claude API races
_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="kelly")

# Track the currently running background task
_active_task = None  # (name, future) or None
_active_lock = threading.Lock()

_shutdown = threading.Event()

# Cached credentials (loaded once on first use)
_bot_base = None
_chat_id = None


def _get_bot_base():
    global _bot_base
    if _bot_base is None:
        token = _get_secret("seo-telegram-bot-token")
        _bot_base = f"https://api.telegram.org/bot{token}"
    return _bot_base


def _get_chat_id():
    global _chat_id
    if _chat_id is None:
        _chat_id = _get_secret("seo-telegram-chat-id")
    return _chat_id


def _chunk_text(text, max_len=4000):
    """Split text into chunks that fit Telegram's 4096-char message limit."""
    if len(text) <= max_len:
        return [text]
    chunks = []
    while text:
        if len(text) <= max_len:
            chunks.append(text)
            break
        cut = text.rfind("\n", 0, max_len)
        if cut == -1:
            cut = max_len
        chunks.append(text[:cut])
        text = text[cut:].lstrip("\n")
    return chunks


def send(text, chat_id=None):
    """Send a text message. Used by command handlers for output."""
    base = _get_bot_base()
    cid = chat_id or _get_chat_id()
    for chunk in _chunk_text(text):
        try:
            resp = requests.post(
                f"{base}/sendMessage",
                json={"chat_id": cid, "text": chunk},
                timeout=10,
            )
            data = resp.json()
            if not data.get("ok"):
                logger.error("Telegram sendMessage failed: %s", data.get("description", data))
            else:
                logger.info("Sent message (%d chars)", len(chunk))
        except Exception as e:
            logger.error("Failed to send message: %s", e)


def send_with_buttons(text, buttons, chat_id=None):
    """Send a message with inline keyboard buttons. Returns message_id."""
    base = _get_bot_base()
    cid = chat_id or _get_chat_id()
    keyboard = {"inline_keyboard": [[btn] for btn in buttons]}
    try:
        resp = requests.post(
            f"{base}/sendMessage",
            json={
                "chat_id": cid,
                "text": text,
                "reply_markup": json.dumps(keyboard),
            },
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("result", {}).get("message_id")
    except Exception as e:
        logger.error("Failed to send message with buttons: %s", e)
        return None


def edit_buttons(message_id, buttons, chat_id=None):
    """Edit inline keyboard on an existing message (e.g. to show checkmark)."""
    base = _get_bot_base()
    cid = chat_id or _get_chat_id()
    keyboard = {"inline_keyboard": [[btn] for btn in buttons]}
    try:
        requests.post(
            f"{base}/editMessageReplyMarkup",
            json={
                "chat_id": cid,
                "message_id": message_id,
                "reply_markup": json.dumps(keyboard),
            },
            timeout=5,
        )
    except Exception:
        pass


def run_in_background(task_name, func, *args, **kwargs):
    """Submit a long-running task to the single-worker executor.

    Returns True if submitted, False if another task is already running.
    """
    global _active_task
    with _active_lock:
        if _active_task and not _active_task[1].done():
            return False
        future = _executor.submit(_safe_run, task_name, func, *args, **kwargs)
        _active_task = (task_name, future)
        return True


def _safe_run(task_name, func, *args, **kwargs):
    """Wrapper that catches all exceptions and reports via Telegram."""
    global _active_task
    logger.info("Background task started: %s", task_name)
    try:
        func(*args, **kwargs)
        logger.info("Background task completed: %s", task_name)
    except Exception as e:
        logger.error("Task '%s' failed: %s", task_name, e, exc_info=True)
        try:
            send(f"Error in {task_name}: {e}")
        except Exception:
            pass
    finally:
        with _active_lock:
            _active_task = None


def get_active_task():
    """Return the name of the currently running background task, or None."""
    with _active_lock:
        if _active_task and not _active_task[1].done():
            return _active_task[0]
    return None


def poll_loop():
    """Main polling loop. Runs forever until _shutdown is set."""
    from scripts.seo.commands import COMMAND_HANDLERS, handle_callback
    from scripts.seo.chat import handle_free_text

    base = _get_bot_base()
    chat_id = _get_chat_id()
    url = f"{base}/getUpdates"
    last_update_id = 0

    # Drain old updates on startup so we don't process stale commands
    try:
        resp = requests.get(url, params={"timeout": 0, "offset": -1}, timeout=10)
        if resp.ok:
            updates = resp.json().get("result", [])
            if updates:
                last_update_id = updates[-1]["update_id"] + 1
    except Exception:
        pass

    send("Kelly is online and listening. Send /help for commands.")

    while not _shutdown.is_set():
        try:
            resp = requests.get(
                url,
                params={"timeout": 30, "offset": last_update_id},
                timeout=35,
            )
            if not resp.ok:
                time.sleep(5)
                continue

            updates = resp.json().get("result", [])
            if updates:
                logger.info("Received %d update(s)", len(updates))
            for update in updates:
                last_update_id = update["update_id"] + 1
                _dispatch(update, chat_id, COMMAND_HANDLERS, handle_callback, handle_free_text)

        except requests.RequestException as e:
            logger.warning("Polling error: %s", e)
            time.sleep(5)
        except Exception as e:
            logger.error("Unexpected error in poll loop: %s", e, exc_info=True)
            time.sleep(5)


def _dispatch(update, expected_chat_id, command_handlers, callback_handler, free_text_handler):
    """Route an update to the appropriate handler."""
    # Handle callback queries (button presses)
    callback = update.get("callback_query")
    if callback:
        logger.info("Callback received: %s", callback.get("data", "?"))
        _acknowledge_callback(callback)
        try:
            callback_handler(callback)
        except Exception as e:
            logger.error("Callback handler error: %s", e, exc_info=True)
        return

    # Handle text messages
    message = update.get("message")
    if not message or not message.get("text"):
        return

    chat_id = str(message["chat"]["id"])
    if chat_id != str(expected_chat_id):
        logger.debug("Ignoring message from chat %s (expected %s)", chat_id, expected_chat_id)
        return

    text = message["text"].strip()
    logger.info("Message received: %s", text[:100])

    # Slash commands
    if text.startswith("/"):
        parts = text.split(maxsplit=1)
        command = parts[0].lower().split("@")[0]  # Strip @botname suffix
        args = parts[1] if len(parts) > 1 else ""

        handler = command_handlers.get(command)
        if handler:
            logger.info("Dispatching command: %s (args: %s)", command, args[:50] if args else "none")
            try:
                handler(args)
            except Exception as e:
                logger.error("Command %s failed: %s", command, e, exc_info=True)
                send(f"Error: {e}")
        else:
            send(f"Unknown command: {command}. Send /help for available commands.")
        return

    # Free-form text -> Claude chat
    logger.info("Routing to free-form chat")
    try:
        free_text_handler(text)
    except Exception as e:
        logger.error("Free text handler error: %s", e, exc_info=True)
        send(f"Error: {e}")


def _acknowledge_callback(callback):
    """Answer callback query to dismiss Telegram's loading spinner."""
    base = _get_bot_base()
    try:
        requests.post(
            f"{base}/answerCallbackQuery",
            json={"callback_query_id": callback["id"]},
            timeout=5,
        )
    except Exception:
        pass


def main():
    signal.signal(signal.SIGTERM, lambda *_: _shutdown.set())
    signal.signal(signal.SIGINT, lambda *_: _shutdown.set())

    logger.info("Starting Kelly SEO Bot...")

    # Start the weekly schedule checker in a background thread
    from scripts.seo.scheduler import start_scheduler
    start_scheduler(_shutdown)

    try:
        poll_loop()
    except KeyboardInterrupt:
        pass
    finally:
        _shutdown.set()
        _executor.shutdown(wait=False)
        logger.info("Kelly SEO Bot stopped.")


if __name__ == "__main__":
    main()
