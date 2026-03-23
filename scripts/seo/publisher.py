"""Publisher — git commit + push to trigger Cloud Build auto-deploy."""

import logging
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parent.parent.parent


def _run_git(args, check=True):
    """Run a git command in the resourcematch repo."""
    result = subprocess.run(
        ["git"] + args,
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=30,
    )
    if check and result.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {result.stderr}")
    return result


def publish_page(file_path, title, page_type="blog", slug=None):
    """Stage, commit, and push a new page to trigger Cloud Build deploy.

    Args:
        file_path: Path to the MDX file
        title: Page title for commit message
        page_type: "blog"
        slug: Page slug (used to find associated images)

    Returns:
        str: commit hash on success
    """
    _run_git(["checkout", "main"])
    _run_git(["pull", "origin", "main"], check=False)

    rel_path = file_path.relative_to(REPO_ROOT)
    _run_git(["add", str(rel_path)])

    # Stage images if they exist
    if slug:
        images_dir = REPO_ROOT / "public" / "blog" / "images" / slug
        if images_dir.exists():
            rel_images = images_dir.relative_to(REPO_ROOT)
            _run_git(["add", str(rel_images)])

    commit_msg = f"Add {page_type}: {title}"
    _run_git(["commit", "-m", commit_msg])

    _run_git(["push", "origin", "main"])
    logger.info("Pushed to GitHub: %s", commit_msg)

    hash_result = _run_git(["rev-parse", "HEAD"])
    return hash_result.stdout.strip()
