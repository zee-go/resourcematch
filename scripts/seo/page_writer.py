"""Page writer — generates MDX files in the resourcematch repo."""

import datetime
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
BLOG_DIR = REPO_ROOT / "content" / "blog"
PAGES_DIR = REPO_ROOT / "content" / "pages"

AUTHOR_BY_PILLAR = {
    "outsourcing_strategy": "Maya Garcia",
    "hiring_best_practices": "Maya Garcia",
    "finance_accounting": "ResourceMatch Team",
    "operations_management": "ResourceMatch Team",
    "industry_insights": "ResourceMatch Team",
}


def _format_frontmatter(data):
    """Convert a dict to YAML frontmatter string."""
    lines = ["---"]
    for key, value in data.items():
        if isinstance(value, list):
            lines.append(f"{key}:")
            for item in value:
                if isinstance(item, dict):
                    lines.append(f"  - anchor: \"{item.get('anchor', '')}\"")
                    lines.append(f"    href: \"{item.get('href', '')}\"")
                else:
                    escaped = str(item).replace('"', '\\"')
                    lines.append(f'  - "{escaped}"')
        elif isinstance(value, dict):
            lines.append(f"{key}:")
            for k, v in value.items():
                escaped = str(v).replace('"', '\\"')
                lines.append(f'  {k}: "{escaped}"')
        elif isinstance(value, bool):
            lines.append(f"{key}: {'true' if value else 'false'}")
        elif isinstance(value, int):
            lines.append(f"{key}: {value}")
        else:
            escaped = str(value).replace('"', '\\"')
            lines.append(f'{key}: "{escaped}"')
    lines.append("---")
    return "\n".join(lines)


def write_blog_post(generated_content, images=None):
    """Write a blog post MDX file to the resourcematch repo.

    Args:
        generated_content: dict from content_generator.generate_blog_post()
        images: dict from image_client.source_images_for_post() or None

    Returns:
        Path to the written file
    """
    BLOG_DIR.mkdir(parents=True, exist_ok=True)

    slug = generated_content["slug"]
    today = datetime.date.today().isoformat()

    frontmatter = {
        "title": generated_content["title"],
        "slug": slug,
        "description": generated_content["meta_description"],
        "date": today,
        "updated": today,
        "author": AUTHOR_BY_PILLAR.get(
            generated_content.get("category", ""), "ResourceMatch Team"
        ),
        "category": generated_content.get("category", "outsourcing_strategy"),
        "tags": generated_content.get("tags", []),
        "keywords": generated_content.get("keywords", []),
        "reading_time": generated_content.get("reading_time", 8),
        "related_posts": generated_content.get("related_posts", []),
        "internal_links": generated_content.get("internal_links", []),
        "target_market": generated_content.get("target_market", "universal"),
        "schema_type": "Article",
    }

    if images and images.get("hero_image"):
        hero = images["hero_image"]
        frontmatter["hero_image"] = hero["path"]
        frontmatter["hero_image_alt"] = hero["alt"]
        frontmatter["hero_image_credit"] = hero["photographer"]
        frontmatter["hero_image_credit_url"] = hero["photographer_url"]

    if images and images.get("mid_image"):
        mid = images["mid_image"]
        frontmatter["mid_image"] = mid["path"]
        frontmatter["mid_image_alt"] = mid["alt"]
        frontmatter["mid_image_credit"] = mid["photographer"]
        frontmatter["mid_image_credit_url"] = mid["photographer_url"]

    mdx_content = _format_frontmatter(frontmatter) + "\n\n" + generated_content["content"]

    file_path = BLOG_DIR / f"{slug}.mdx"
    with open(file_path, "w") as f:
        f.write(mdx_content)

    logger.info("Wrote blog post: %s", file_path)
    return file_path


def write_landing_page(generated_content, images=None):
    """Write a landing page MDX file to content/pages/.

    Args:
        generated_content: dict from content_generator.generate_landing_page()
        images: dict from image_client.source_images_for_post() or None

    Returns:
        Path to the written file
    """
    PAGES_DIR.mkdir(parents=True, exist_ok=True)

    slug = generated_content["slug"]
    today = datetime.date.today().isoformat()

    frontmatter = {
        "title": generated_content["title"],
        "slug": slug,
        "description": generated_content["meta_description"],
        "date": today,
        "updated": today,
        "category": generated_content.get("category", "outsourcing_strategy"),
        "keywords": generated_content.get("keywords", []),
        "target_market": generated_content.get("target_market", "universal"),
        "schema_type": "WebPage",
    }

    if generated_content.get("cta_title"):
        frontmatter["cta_title"] = generated_content["cta_title"]
    if generated_content.get("cta_description"):
        frontmatter["cta_description"] = generated_content["cta_description"]
    if generated_content.get("cta_button_text"):
        frontmatter["cta_button_text"] = generated_content["cta_button_text"]
    if generated_content.get("cta_button_href"):
        frontmatter["cta_button_href"] = generated_content["cta_button_href"]

    if images and images.get("hero_image"):
        hero = images["hero_image"]
        frontmatter["hero_image"] = hero["path"]
        frontmatter["hero_image_alt"] = hero["alt"]
        frontmatter["hero_image_credit"] = hero["photographer"]
        frontmatter["hero_image_credit_url"] = hero["photographer_url"]

    mdx_content = _format_frontmatter(frontmatter) + "\n\n" + generated_content["content"]

    file_path = PAGES_DIR / f"{slug}.mdx"
    with open(file_path, "w") as f:
        f.write(mdx_content)

    logger.info("Wrote landing page: %s", file_path)
    return file_path
