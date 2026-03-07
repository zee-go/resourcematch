"""Secret loader — reads from local cache, falls back to Google Secret Manager."""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_ROOT = PROJECT_ROOT

GCP_PROJECT = "resourcematch"

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


def _get_secret(secret_id):
    cache = _load_cache()
    if secret_id in cache:
        return cache[secret_id]

    # Fallback to Secret Manager if not in local cache
    from google.cloud import secretmanager

    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{GCP_PROJECT}/secrets/{secret_id}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")
