"""Centralized logging setup — per-agent log files."""

import logging
from pathlib import Path

LOGS_DIR = Path(__file__).resolve().parent.parent / "logs"


def setup_logging(agent_name):
    """Configure logging to logs/{agent_name}.log + stderr."""
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOGS_DIR / f"{agent_name}.log"
    logging.basicConfig(
        level=logging.INFO,
        format=f"%(asctime)s [{agent_name}] [%(levelname)s] %(message)s",
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(),
        ],
    )
