"""LinkedIn queue — manages messages for manual sending via Telegram.

The bot generates personalized messages and queues them.
Each morning, Telegram sends copy-paste-ready messages.
The user sends them manually on LinkedIn and marks them as sent.
"""

import logging

from scripts.outreach.state import (
    get_linkedin_queue,
    add_to_linkedin_queue,
    mark_linkedin_sent,
)
from scripts.outreach.telegram import (
    send_telegram_message,
    send_message_with_inline_keyboard,
    poll_for_callback,
)

logger = logging.getLogger(__name__)


def queue_linkedin_message(prospect, linkedin_content):
    """Add a LinkedIn outreach task to the queue.

    Args:
        prospect: dict with name, email, linkedin_url, etc.
        linkedin_content: dict from linkedin_composer with connection_note, followup_message
    """
    entry = {
        "name": prospect.get("name", ""),
        "email": prospect.get("email", ""),
        "title": prospect.get("title", ""),
        "company": prospect.get("company_name", ""),
        "linkedin_url": prospect.get("linkedin_url", ""),
        "connection_note": linkedin_content.get("connection_note", ""),
        "followup_message": linkedin_content.get("followup_message", ""),
    }
    add_to_linkedin_queue(entry)
    logger.info("Queued LinkedIn message for %s", entry["name"])


def send_daily_linkedin_tasks():
    """Send today's LinkedIn tasks to Telegram as copy-paste-ready messages.

    Returns the number of tasks sent.
    """
    queue = get_linkedin_queue()
    pending = queue.get("pending", [])

    if not pending:
        return 0

    # Send up to 15 tasks (recommended daily LinkedIn outreach limit)
    daily_batch = pending[:15]

    send_telegram_message(
        f"[Maya] LinkedIn Tasks for Today ({len(daily_batch)} prospects)\n\n"
        "Copy-paste the connection notes below. After sending each one on LinkedIn, "
        "tap 'Sent' to mark it done."
    )

    for i, task in enumerate(daily_batch, 1):
        text = (
            f"--- LinkedIn Task {i}/{len(daily_batch)} ---\n\n"
            f"Name: {task['name']}\n"
            f"Title: {task['title']} at {task['company']}\n"
        )

        if task.get("linkedin_url"):
            text += f"Profile: {task['linkedin_url']}\n"

        text += (
            f"\nConnection Note (copy this):\n"
            f"---\n"
            f"{task['connection_note']}\n"
            f"---\n"
            f"\nFollow-up (send after they accept):\n"
            f"---\n"
            f"{task['followup_message']}\n"
            f"---"
        )

        buttons = [
            {"text": "Sent", "callback_data": f"outreach_li_sent_{i}"},
            {"text": "Skip", "callback_data": f"outreach_li_skip_{i}"},
        ]

        msg_id = send_message_with_inline_keyboard(text, buttons)

        # Non-blocking: don't wait for each response, just queue them
        # User can tap buttons throughout the day

    return len(daily_batch)


def process_linkedin_callbacks():
    """Process any pending LinkedIn task callbacks from Telegram.

    This is called periodically to mark tasks as sent/skipped.
    Non-blocking — returns immediately if no callbacks.
    """
    queue = get_linkedin_queue()
    pending = queue.get("pending", [])

    # Poll briefly for any callbacks
    response = poll_for_callback(
        prefix="outreach_li_",
        timeout_minutes=1,
        poll_interval=2,
    )

    if response and response.startswith("outreach_li_sent_"):
        idx = int(response.split("_")[-1]) - 1
        if 0 <= idx < len(pending):
            mark_linkedin_sent(pending[idx].get("email", ""))
            logger.info("LinkedIn task marked sent: %s", pending[idx].get("name"))

    return response
