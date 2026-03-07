"""Google Search Console client — fetches search analytics for resourcematch.ph."""

import datetime
import logging

import google.auth
from googleapiclient.discovery import build

from scripts.seo.state import get_state

logger = logging.getLogger(__name__)

SITE_DOMAIN = "resourcematch.ph"
SITE_URL = None  # Discovered at runtime


def _get_service():
    creds, _ = google.auth.default(
        scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
    )
    return build("searchconsole", "v1", credentials=creds)


def _discover_property(service):
    """Find the GSC property URL for resourcematch.ph."""
    global SITE_URL
    if SITE_URL:
        return SITE_URL
    sites = service.sites().list().execute()
    for site in sites.get("siteEntry", []):
        if SITE_DOMAIN in site["siteUrl"]:
            SITE_URL = site["siteUrl"]
            logger.info("Discovered GSC property: %s", SITE_URL)
            return SITE_URL
    raise RuntimeError(f"{SITE_DOMAIN} not found in Search Console properties")


def _query(service, site_url, start_date, end_date, dimensions=None, row_limit=10):
    """Run a searchAnalytics.query and return rows."""
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "rowLimit": row_limit,
    }
    if dimensions:
        body["dimensions"] = dimensions

    result = service.searchanalytics().query(siteUrl=site_url, body=body).execute()
    return result.get("rows", [])


def _date_range():
    """Return (current_start, current_end, prev_start, prev_end) as strings.

    GSC data has a ~3-day lag. Current week = 7-day window ending 3 days ago.
    Previous week = same window shifted back 7 days.
    """
    today = datetime.date.today()
    end = today - datetime.timedelta(days=3)
    start = end - datetime.timedelta(days=6)
    prev_end = start - datetime.timedelta(days=1)
    prev_start = prev_end - datetime.timedelta(days=6)
    return (
        start.isoformat(), end.isoformat(),
        prev_start.isoformat(), prev_end.isoformat(),
    )


def _published_urls():
    """Map full URL -> (slug, title, page_type, date) for all published pages."""
    state = get_state()
    urls = {}
    for post in state.get("blog_posts", []):
        url = f"https://{SITE_DOMAIN}/blog/{post['slug']}"
        urls[url] = {
            "slug": post["slug"],
            "title": post["title"],
            "page_type": "blog",
            "date": post.get("date"),
        }
    return urls


def _extract_totals(rows):
    """Extract site-wide totals from a no-dimension query result."""
    if not rows:
        return {"impressions": 0, "clicks": 0, "ctr": 0.0, "position": 0.0}
    row = rows[0]
    return {
        "impressions": row.get("impressions", 0),
        "clicks": row.get("clicks", 0),
        "ctr": row.get("ctr", 0.0),
        "position": row.get("position", 0.0),
    }


def _calc_delta(current, previous):
    """Calculate percentage change between two metric dicts."""
    deltas = {}
    for key in ("impressions", "clicks", "ctr"):
        old = previous.get(key, 0)
        new = current.get(key, 0)
        if old > 0:
            deltas[key] = ((new - old) / old) * 100
        elif new > 0:
            deltas[key] = 100.0
        else:
            deltas[key] = 0.0
    # Position: lower is better, so invert the sign for display
    old_pos = previous.get("position", 0)
    new_pos = current.get("position", 0)
    if old_pos > 0 and new_pos > 0:
        deltas["position"] = old_pos - new_pos  # positive = improved
    else:
        deltas["position"] = 0.0
    return deltas


def get_weekly_traffic_report():
    """Fetch GSC data and build the weekly traffic report.

    Returns a structured dict, or None on failure.
    """
    try:
        service = _get_service()
        site_url = _discover_property(service)
    except Exception as e:
        logger.error("Failed to connect to Search Console: %s", e)
        return None

    cur_start, cur_end, prev_start, prev_end = _date_range()

    # Site totals — current and previous week
    cur_rows = _query(service, site_url, cur_start, cur_end)
    prev_rows = _query(service, site_url, prev_start, prev_end)
    cur_totals = _extract_totals(cur_rows)
    prev_totals = _extract_totals(prev_rows)
    deltas = _calc_delta(cur_totals, prev_totals)

    no_data = cur_totals["impressions"] == 0 and cur_totals["clicks"] == 0

    # Per-page breakdown
    page_rows = _query(service, site_url, cur_start, cur_end,
                       dimensions=["page"], row_limit=50)
    published = _published_urls()
    pages = []
    seen_slugs = set()
    for row in page_rows:
        url = row["keys"][0]
        info = published.get(url)
        if info:
            pages.append({
                "page": url,
                "slug": info["slug"],
                "title": info["title"],
                "page_type": info["page_type"],
                "impressions": row.get("impressions", 0),
                "clicks": row.get("clicks", 0),
                "ctr": row.get("ctr", 0.0),
                "position": row.get("position", 0.0),
            })
            seen_slugs.add(info["slug"])

    # Add published pages with no GSC data yet
    for url, info in published.items():
        if info["slug"] not in seen_slugs:
            pages.append({
                "page": url,
                "slug": info["slug"],
                "title": info["title"],
                "page_type": info["page_type"],
                "date": info.get("date"),
                "no_data": True,
            })

    # Sort: pages with data first (by impressions desc), then no-data pages
    pages.sort(key=lambda p: (p.get("no_data", False), -p.get("impressions", 0)))

    # Top queries
    query_rows = _query(service, site_url, cur_start, cur_end,
                        dimensions=["query"], row_limit=10)
    top_queries = []
    for row in query_rows:
        top_queries.append({
            "query": row["keys"][0],
            "impressions": row.get("impressions", 0),
            "clicks": row.get("clicks", 0),
            "ctr": row.get("ctr", 0.0),
            "position": row.get("position", 0.0),
        })

    return {
        "report_date": datetime.date.today().isoformat(),
        "current_week": {"start": cur_start, "end": cur_end},
        "previous_week": {"start": prev_start, "end": prev_end},
        "site_totals": {
            "current": cur_totals,
            "previous": prev_totals,
            "deltas": deltas,
        },
        "pages": pages,
        "top_queries": top_queries,
        "no_data": no_data,
    }
