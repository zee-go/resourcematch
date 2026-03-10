"""Kelly — formats SEO content for Telegram preview messages."""

import datetime


def _arrow(value, invert=False):
    """Return arrow indicator. invert=True for metrics where lower is better (position)."""
    if abs(value) < 1:
        return ""
    if invert:
        return "\u2191" if value > 0 else "\u2193"
    return "\u2191" if value > 0 else "\u2193"


def _pct(value):
    """Format a percentage change."""
    if abs(value) < 1:
        return ""
    return f"{abs(value):.0f}%"


def format_traffic_report(report, previous_snapshot=None):
    """Format GSC traffic data as a Telegram message."""
    if report.get("no_data"):
        return (
            "Kelly's Traffic Report (ResourceMatch)\n\n"
            "No search traffic data yet. GSC typically takes 1-2 weeks "
            "to start reporting for new sites."
        )

    cur = report["current_week"]
    totals = report["site_totals"]["current"]
    deltas = report["site_totals"]["deltas"]
    has_previous = previous_snapshot is not None

    start = datetime.date.fromisoformat(cur["start"])
    end = datetime.date.fromisoformat(cur["end"])
    lines = [
        f"Kelly's Traffic Report — {start.strftime('%b %d')}-{end.strftime('%d')}\n",
        "SITE OVERVIEW (resourcematch.ph)",
    ]

    imp = totals["impressions"]
    clicks = totals["clicks"]
    ctr = totals["ctr"] * 100
    pos = totals["position"]

    if has_previous:
        d_imp = deltas["impressions"]
        d_clicks = deltas["clicks"]
        d_ctr = deltas["ctr"]
        d_pos = deltas["position"]

        imp_delta = f"  ({_arrow(d_imp)}{_pct(d_imp)})" if abs(d_imp) >= 1 else ""
        click_delta = f"  ({_arrow(d_clicks)}{_pct(d_clicks)})" if abs(d_clicks) >= 1 else ""
        ctr_delta = f"  ({_arrow(d_ctr)}{_pct(d_ctr)})" if abs(d_ctr) >= 1 else ""
        pos_delta = f"  ({_arrow(d_pos, invert=True)}{abs(d_pos):.0f} spots)" if abs(d_pos) >= 1 else ""
    else:
        imp_delta = click_delta = ctr_delta = pos_delta = ""

    lines.append(f"Impressions: {imp:,}{imp_delta}")
    lines.append(f"Clicks: {clicks:,}{click_delta}")
    lines.append(f"CTR: {ctr:.1f}%{ctr_delta}")
    lines.append(f"Avg Position: {pos:.1f}{pos_delta}")

    if not has_previous:
        lines.append("\nFirst traffic report — comparisons start next week.")

    pages = report.get("pages", [])
    if pages:
        lines.append("\nPAGE PERFORMANCE")
        for i, p in enumerate(pages[:5], 1):
            if p.get("no_data"):
                days_ago = ""
                if p.get("date"):
                    pub = datetime.date.fromisoformat(p["date"])
                    days = (datetime.date.today() - pub).days
                    days_ago = f" (published {days} days ago)"
                lines.append(f"{i}. {p['title']}")
                lines.append(f"   No data yet{days_ago}")
            else:
                lines.append(f"{i}. {p['title']}")
                lines.append(
                    f"   {p['impressions']} imp / {p['clicks']} clicks / "
                    f"CTR {p['ctr']*100:.1f}% / Pos {p['position']:.0f}"
                )

    queries = report.get("top_queries", [])
    if queries:
        lines.append("\nTOP SEARCH QUERIES")
        for i, q in enumerate(queries[:5], 1):
            lines.append(
                f'{i}. "{q["query"]}" \u2014 '
                f'{q["impressions"]} imp / {q["clicks"]} clicks / '
                f'Pos {q["position"]:.0f}'
            )

    return "\n".join(lines)


def format_no_traffic_data():
    """Brief message when GSC API call fails entirely."""
    return "Could not fetch traffic data this week \u2014 continuing with content."


def format_weekly_plan(calendar):
    """Format the weekly content plan as a Telegram message."""
    lines = [
        f"Kelly's Content Plan (ResourceMatch) \u2014 Week {calendar.get('week_number', '?')}\n",
        f"Focus pillar: {calendar.get('focus_pillar', 'mixed')}\n",
    ]

    for i, item in enumerate(calendar.get("items", []), 1):
        market = item.get("target_market", "universal")
        market_label = market.upper() if market != "universal" else "ALL"
        lines.append(
            f"{i}. [{market_label}] [BLOG] {item['title_suggestion']}\n"
            f"   Keyword: {item['primary_keyword']}\n"
            f"   Publish: {item['publish_date']}\n"
        )

    return "\n".join(lines)


def format_content_preview(content, page_type):
    """Format a generated page as a Telegram preview for approval."""
    title = content.get("title", "Untitled")
    meta = content.get("meta_description", "")
    slug = content.get("slug", "")
    keywords = content.get("keywords", [])

    body = content.get("content", "")
    preview_body = body[:500] + "..." if len(body) > 500 else body

    market = content.get("target_market", "universal")
    market_label = market.upper() if market != "universal" else "ALL MARKETS"

    lines = [
        "--- SEO CONTENT PREVIEW ---\n",
        f"Type: BLOG",
        f"Market: {market_label}",
        f"Title: {title}",
        f"URL: resourcematch.ph/blog/{slug}",
        f"Meta: {meta}",
        f"Keywords: {', '.join(keywords[:5])}\n",
        "--- CONTENT PREVIEW ---\n",
        preview_body,
        "\n--- END PREVIEW ---",
        f"\nFull length: ~{len(body.split())} words",
    ]

    return "\n".join(lines)


def format_publish_confirmation(title, slug, page_type, commit_hash):
    """Format a publish success message."""
    return (
        f"Published: {title}\n\n"
        f"URL: resourcematch.ph/blog/{slug}\n"
        f"Commit: {commit_hash[:8]}\n"
        f"Cloud Build deploy triggered \u2014 live in ~3 minutes."
    )


def format_weekly_summary(state):
    """Format a weekly SEO summary."""
    total = state.get("total_published", 0)
    blogs = len(state.get("blog_posts", []))
    keywords_covered = len(state.get("keyword_coverage", {}))
    clusters = len(state.get("topic_clusters", {}))

    lines = [
        "Kelly's Weekly Summary (ResourceMatch)\n",
        f"Total blog posts: {total}",
        f"Keywords targeted: {keywords_covered}",
        f"Topic clusters: {clusters}",
    ]

    market_coverage = state.get("market_coverage", {})
    if market_coverage:
        lines.append(f"\nMarket coverage:")
        for market, slugs in sorted(market_coverage.items()):
            lines.append(f"  {market.upper()}: {len(slugs)} posts")

    recent = sorted(
        state.get("blog_posts", []),
        key=lambda x: x.get("date", ""),
        reverse=True,
    )[:5]
    if recent:
        lines.append("\nRecent:")
        for p in recent:
            lines.append(f"  {p['date']} \u2014 {p['title']}")

    return "\n".join(lines)
