"""Email sender — Gmail SMTP with sequence scheduling and warmup ramp.

Sends personalized cold emails via Google Workspace mailbox on a separate sending domain.
Handles:
- SMTP connection and authentication (Gmail app password)
- Warmup ramp (5/day → 50/day over 10 days)
- Sequence scheduling (respects timing between touches)
- CAN-SPAM compliance (unsubscribe footer)
"""

import logging
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from scripts.outreach.config import (
    get_gmail_app_password,
    get_gmail_sender_email,
    get_gmail_sender_name,
)

logger = logging.getLogger(__name__)

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

# Human-like sending: random delay between emails (seconds)
MIN_DELAY = 30
MAX_DELAY = 120


def send_email(to_email, subject, body, reply_to=None):
    """Send a single email via Gmail SMTP.

    Args:
        to_email: recipient email address
        subject: email subject line
        body: plain text email body (should include CAN-SPAM footer)
        reply_to: optional reply-to address

    Returns:
        True on success, False on failure
    """
    sender_email = get_gmail_sender_email()
    sender_name = get_gmail_sender_name()
    app_password = get_gmail_app_password()

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to

    # Plain text version
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.starttls()
            server.login(sender_email, app_password)
            server.send_message(msg)

        logger.info("Email sent to %s: %s", to_email, subject)
        return True

    except smtplib.SMTPRecipientsRefused as e:
        logger.warning("Recipient refused (bounce): %s — %s", to_email, e)
        from scripts.outreach.state import mark_bounced
        mark_bounced(to_email)
        return False

    except smtplib.SMTPException as e:
        logger.error("SMTP error sending to %s: %s", to_email, e)
        return False

    except Exception as e:
        logger.error("Unexpected error sending to %s: %s", to_email, e)
        return False


def send_batch(emails_to_send, daily_limit):
    """Send a batch of emails with human-like delays, respecting daily limits.

    Args:
        emails_to_send: list of dicts with to_email, subject, body
        daily_limit: max emails to send today (from warmup ramp)

    Returns:
        dict with sent_count, failed_count, bounced_count
    """
    import random

    results = {"sent_count": 0, "failed_count": 0, "bounced_count": 0}
    batch = emails_to_send[:daily_limit]

    for i, email in enumerate(batch):
        success = send_email(
            to_email=email["to_email"],
            subject=email["subject"],
            body=email["body"],
        )

        if success:
            results["sent_count"] += 1
            from scripts.outreach.state import mark_sent
            mark_sent(email["to_email"], email.get("step", 1))
        else:
            results["failed_count"] += 1

        # Human-like delay between sends (skip after last email)
        if i < len(batch) - 1:
            delay = random.uniform(MIN_DELAY, MAX_DELAY)
            logger.debug("Waiting %.0fs before next send...", delay)
            time.sleep(delay)

    logger.info(
        "Batch complete: %d sent, %d failed, %d bounced",
        results["sent_count"], results["failed_count"], results["bounced_count"],
    )
    return results
