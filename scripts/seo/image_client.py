"""Image client — Unsplash API integration for blog post images."""

import logging
from pathlib import Path

import requests

from scripts.seo.config import _get_secret

logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
BLOG_IMAGES_DIR = REPO_ROOT / "public" / "blog" / "images"

UNSPLASH_BASE = "https://api.unsplash.com"


def _get_unsplash_key():
    return _get_secret("unsplash-access-key")


def search_image(query, orientation="landscape", exclude_ids=None):
    """Search Unsplash for a relevant image.

    Args:
        query: Search terms
        orientation: Image orientation
        exclude_ids: Set of photo IDs to skip (for deduplication)

    Returns:
        dict with id, url, alt, photographer, photographer_url, unsplash_url
        or None if search fails.
    """
    exclude_ids = exclude_ids or set()
    try:
        resp = requests.get(
            f"{UNSPLASH_BASE}/search/photos",
            params={
                "query": query,
                "orientation": orientation,
                "per_page": 5,
                "content_filter": "high",
            },
            headers={"Authorization": f"Client-ID {_get_unsplash_key()}"},
            timeout=15,
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])

        for photo in results:
            if photo["id"] in exclude_ids:
                continue
            return {
                "id": photo["id"],
                "url": photo["urls"]["regular"],
                "alt": photo.get("alt_description", ""),
                "photographer": photo["user"]["name"],
                "photographer_url": photo["user"]["links"]["html"],
                "unsplash_url": photo["links"]["html"],
            }
        return None
    except Exception as e:
        logger.warning("Unsplash search failed for '%s': %s", query, e)
        return None


def download_image(image_info, slug, filename):
    """Download image to resourcematch public directory.

    Returns:
        str: public path like "/blog/images/{slug}/hero.jpg"
    """
    dest_dir = BLOG_IMAGES_DIR / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_file = dest_dir / filename

    resp = requests.get(image_info["url"], timeout=30)
    resp.raise_for_status()
    dest_file.write_bytes(resp.content)

    logger.info("Downloaded image: %s", dest_file)
    return f"/blog/images/{slug}/{filename}"


def source_images_for_post(slug, title, primary_keyword, secondary_keywords=None):
    """Source hero + mid-article images for a blog post.

    Returns:
        dict with hero_image and mid_image entries, each containing
        path, alt, photographer, photographer_url. Missing images are None.
    """
    result = {"hero_image": None, "mid_image": None}

    # Hero image with fallback queries
    hero_queries = [
        f"{primary_keyword} professional office philippines",
        f"{primary_keyword} business professional",
        "remote work professional office",
    ]
    hero_info = None
    for query in hero_queries:
        hero_info = search_image(query, orientation="landscape")
        if hero_info:
            break
    if hero_info:
        path = download_image(hero_info, slug, "hero.jpg")
        result["hero_image"] = {
            "path": path,
            "alt": hero_info["alt"] or title,
            "photographer": hero_info["photographer"],
            "photographer_url": hero_info["photographer_url"],
        }
    else:
        logger.warning("No hero image found for '%s' after all fallbacks", slug)

    # Mid-article image with fallback queries
    hero_ids = {hero_info["id"]} if hero_info else set()
    mid_keyword = secondary_keywords[0] if secondary_keywords else primary_keyword
    mid_queries = [
        f"{mid_keyword} teamwork",
        f"{mid_keyword} professional",
        "team collaboration office",
    ]
    mid_info = None
    for query in mid_queries:
        mid_info = search_image(query, orientation="landscape", exclude_ids=hero_ids)
        if mid_info:
            break
    if mid_info:
        path = download_image(mid_info, slug, "mid.jpg")
        result["mid_image"] = {
            "path": path,
            "alt": mid_info["alt"] or f"{primary_keyword} illustration",
            "photographer": mid_info["photographer"],
            "photographer_url": mid_info["photographer_url"],
        }
    else:
        logger.warning("No mid image found for '%s' after all fallbacks", slug)

    return result
