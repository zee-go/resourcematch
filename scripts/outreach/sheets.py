"""Google Sheets sync — pushes candidate leads to a shared spreadsheet.

Each approved candidate prospect gets a row with name, source, vertical,
LinkedIn/Reddit URL, personalized outreach messages, and status.
"""

import logging

import gspread

from scripts.outreach.config import get_candidate_sheet_id

logger = logging.getLogger(__name__)

HEADERS = [
    "Name",
    "Source",
    "Vertical",
    "Status",
    "LinkedIn / Reddit URL",
    "Company",
    "Description",
    "Connection Note",
    "Follow-up Message",
    "Location",
    "Found At",
    "Messaged At",
]


def _get_credentials():
    """Build OAuth2 credentials directly from the ADC file.

    Reads the refresh token from ~/.config/gcloud/application_default_credentials.json
    and refreshes it explicitly. More reliable than google.auth.default() which can
    fail when gcloud's session cache goes stale.
    """
    import json
    from pathlib import Path

    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request

    adc_path = Path.home() / ".config" / "gcloud" / "application_default_credentials.json"
    if not adc_path.exists():
        raise FileNotFoundError(
            "No ADC file found. Run: gcloud auth application-default login "
            "--scopes=https://www.googleapis.com/auth/spreadsheets,"
            "https://www.googleapis.com/auth/drive,"
            "https://www.googleapis.com/auth/cloud-platform"
        )

    adc = json.loads(adc_path.read_text())

    creds = Credentials(
        token=None,
        refresh_token=adc["refresh_token"],
        client_id=adc["client_id"],
        client_secret=adc["client_secret"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=[
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
        ],
    )
    creds.refresh(Request())

    # Wrap with quota project so Sheets API billing is attributed correctly
    quota_project = adc.get("quota_project_id")
    if quota_project:
        creds = creds.with_quota_project(quota_project)

    return creds


def _get_worksheet():
    """Open the candidate leads worksheet, creating headers if needed."""
    sheet_id = get_candidate_sheet_id()
    if not sheet_id:
        raise ValueError("candidate-sheet-id not configured in secrets.json")

    creds = _get_credentials()
    gc = gspread.Client(auth=creds)
    spreadsheet = gc.open_by_key(sheet_id)
    worksheet = spreadsheet.sheet1

    # Add headers if the sheet is empty
    existing = worksheet.row_values(1)
    if not existing or existing[0] != HEADERS[0]:
        worksheet.update([HEADERS], "A1")
        worksheet.format("A1:L1", {"textFormat": {"bold": True}})

    return worksheet


def _candidate_to_row(candidate):
    """Convert a candidate prospect dict to a sheet row."""
    messages = candidate.get("messages", {})
    url = candidate.get("url", "") or candidate.get("linkedin_url", "")

    return [
        candidate.get("name", "") or candidate.get("author", ""),
        candidate.get("source", ""),
        candidate.get("vertical", ""),
        candidate.get("status", "drafted"),
        url,
        candidate.get("company", ""),
        candidate.get("description", "") or candidate.get("title", ""),
        messages.get("connection_note", "") or messages.get("comment", ""),
        messages.get("followup_message", "") or messages.get("dm", ""),
        "Philippines",
        candidate.get("found_at", ""),
        candidate.get("messaged_at", ""),
    ]


def sync_candidate_to_sheet(candidate):
    """Append a single candidate lead to the Google Sheet.

    Called after a candidate is approved in the outreach flow.
    Non-blocking — logs errors but doesn't raise.
    """
    try:
        worksheet = _get_worksheet()
        row = _candidate_to_row(candidate)
        worksheet.append_row(row, value_input_option="USER_ENTERED")
        logger.info("Synced candidate to sheet: %s",
                     candidate.get("name") or candidate.get("author"))
    except Exception as e:
        logger.error("Failed to sync candidate to sheet: %s", e)


def sync_all_candidates_to_sheet():
    """Bulk export all candidates from local state to Google Sheet.

    Clears existing data (keeps headers) and writes all candidates.
    Useful for backfills or recovery.
    """
    from scripts.outreach.state import get_candidate_state

    state = get_candidate_state()
    candidates = state.get("candidates", [])

    if not candidates:
        logger.info("No candidates to sync.")
        return 0

    try:
        worksheet = _get_worksheet()

        # Clear everything below headers
        if worksheet.row_count > 1:
            worksheet.batch_clear(["A2:L"])

        # Build all rows
        rows = [_candidate_to_row(c) for c in candidates]
        worksheet.update(rows, f"A2:L{len(rows) + 1}", value_input_option="USER_ENTERED")

        logger.info("Bulk synced %d candidates to sheet.", len(rows))
        return len(rows)

    except Exception as e:
        logger.error("Failed to bulk sync candidates to sheet: %s", e)
        return 0
