"""Configuration loader — reuses existing secrets infrastructure."""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_ROOT = PROJECT_ROOT

PLAYBOOK_PATH = PROJECT_ROOT.parent / "docs" / "strategy" / "ceo-playbook.md"
DATA_DIR = Path(__file__).resolve().parent / "data"
METRICS_FILE = DATA_DIR / "metrics.json"

# Claude model for the CEO bot
DEFAULT_MODEL = "claude-sonnet-4-20250514"
DEEP_STRATEGY_MODEL = "claude-opus-4-20250514"

_SECRETS_FILE = SCRIPTS_ROOT / "data" / "secrets.json"
_cache = None


def _load_cache():
    global _cache
    if _cache is None:
        if _SECRETS_FILE.exists():
            _cache = json.loads(_SECRETS_FILE.read_text())
        else:
            _cache = {}
    return _cache


def get_anthropic_key():
    """Get the Anthropic API key from local secrets or GCP Secret Manager."""
    cache = _load_cache()
    if "anthropic-api-key" in cache:
        return cache["anthropic-api-key"]

    # Fallback to Secret Manager
    from google.cloud import secretmanager

    client = secretmanager.SecretManagerServiceClient()
    name = "projects/resourcematch/secrets/anthropic-api-key/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")
