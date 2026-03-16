"""Outreach agent config — extends Kelly's secret loader with outreach-specific keys."""

from scripts.seo.config import _get_secret  # noqa: F401 — re-export


def get_apollo_api_key():
    return _get_secret("apollo-api-key")


def get_gmail_app_password():
    return _get_secret("outreach-gmail-app-password")


def get_gmail_sender_email():
    return _get_secret("outreach-gmail-sender-email")


def get_gmail_sender_name():
    return _get_secret("outreach-gmail-sender-name")


def get_anthropic_api_key():
    return _get_secret("anthropic-api-key")


def get_database_url():
    return _get_secret("database-url")


def get_physical_address():
    """CAN-SPAM required physical mailing address."""
    return _get_secret("outreach-physical-address")


def get_candidate_sheet_id():
    """Google Sheet ID for candidate leads tracker."""
    return _get_secret("candidate-sheet-id")


