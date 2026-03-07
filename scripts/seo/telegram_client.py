"""Unified Telegram Bot API client.

Each agent creates its own instance with the appropriate bot token and chat ID.
"""

import json
import time

import requests

TELEGRAM_API_BASE = "https://api.telegram.org/bot{token}"


class TelegramClient:
    def __init__(self, bot_token, chat_id):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self._base = TELEGRAM_API_BASE.format(token=bot_token)

    def send_message(self, text):
        """Send a text message. Returns True on success."""
        url = f"{self._base}/sendMessage"
        payload = {"chat_id": self.chat_id, "text": text}
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return response.json().get("ok", False)

    def send_message_with_inline_keyboard(self, text, buttons):
        """Send a message with inline keyboard buttons.

        buttons: list of dicts with 'text' and 'callback_data' keys.
        Returns the message_id of the sent message.
        """
        url = f"{self._base}/sendMessage"
        keyboard = {"inline_keyboard": [[btn] for btn in buttons]}
        payload = {
            "chat_id": self.chat_id,
            "text": text,
            "reply_markup": json.dumps(keyboard),
        }
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return response.json().get("result", {}).get("message_id")

    def poll_for_callback(self, prefix="", timeout_minutes=120, poll_interval=5,
                          message_id=None, buttons=None):
        """Poll for inline keyboard callback matching the given prefix.

        Uses Telegram long polling. Returns the callback_data string or None on timeout.

        If message_id and buttons are provided, edits the keyboard after selection to
        show only the chosen button prefixed with a checkmark, giving visual confirmation.
        """
        url = f"{self._base}/getUpdates"
        answer_url = f"{self._base}/answerCallbackQuery"
        edit_url = f"{self._base}/editMessageReplyMarkup"
        deadline = time.time() + (timeout_minutes * 60)
        last_update_id = 0

        # Skip old updates
        resp = requests.get(url, params={"timeout": 0, "offset": -1}, timeout=10)
        if resp.ok:
            updates = resp.json().get("result", [])
            if updates:
                last_update_id = updates[-1]["update_id"] + 1

        while time.time() < deadline:
            try:
                resp = requests.get(
                    url,
                    params={"timeout": poll_interval, "offset": last_update_id},
                    timeout=poll_interval + 5,
                )
                if not resp.ok:
                    time.sleep(poll_interval)
                    continue

                for update in resp.json().get("result", []):
                    last_update_id = update["update_id"] + 1
                    callback = update.get("callback_query")
                    if callback and callback.get("data", "").startswith(prefix):
                        # Acknowledge callback to dismiss the loading spinner
                        requests.post(
                            answer_url,
                            json={"callback_query_id": callback["id"]},
                            timeout=5,
                        )
                        # Mark the selected button with a checkmark
                        if message_id and buttons:
                            selected_data = callback["data"]
                            selected_btn = next(
                                (b for b in buttons if b["callback_data"] == selected_data),
                                None,
                            )
                            if selected_btn:
                                updated_keyboard = [[{
                                    "text": f"\u2713 {selected_btn['text']}",
                                    "callback_data": selected_data,
                                }]]
                                requests.post(
                                    edit_url,
                                    json={
                                        "chat_id": self.chat_id,
                                        "message_id": message_id,
                                        "reply_markup": json.dumps({"inline_keyboard": updated_keyboard}),
                                    },
                                    timeout=5,
                                )
                        return callback["data"]
            except requests.RequestException:
                time.sleep(poll_interval)

        return None

    def poll_for_text_reply(self, timeout_minutes=30, poll_interval=5):
        """Poll for a text message reply from the user.

        Returns the message text string or None on timeout.
        """
        url = f"{self._base}/getUpdates"
        deadline = time.time() + (timeout_minutes * 60)
        last_update_id = 0

        # Skip old updates
        resp = requests.get(url, params={"timeout": 0, "offset": -1}, timeout=10)
        if resp.ok:
            updates = resp.json().get("result", [])
            if updates:
                last_update_id = updates[-1]["update_id"] + 1

        while time.time() < deadline:
            try:
                resp = requests.get(
                    url,
                    params={"timeout": poll_interval, "offset": last_update_id},
                    timeout=poll_interval + 5,
                )
                if not resp.ok:
                    time.sleep(poll_interval)
                    continue

                for update in resp.json().get("result", []):
                    last_update_id = update["update_id"] + 1
                    message = update.get("message")
                    if message and message.get("text"):
                        if str(message["chat"]["id"]) == str(self.chat_id):
                            return message["text"]
            except requests.RequestException:
                time.sleep(poll_interval)

        return None
