"""Maya — formats outreach data for Telegram preview messages."""


def format_prospect_preview(prospect, candidates, email_sequence):
    """Format a prospect + email sequence preview for Telegram approval."""
    lines = [
        "--- OUTREACH PREVIEW ---\n",
        f"Prospect: {prospect.get('first_name', '')} {prospect.get('last_name', '')}",
        f"Title: {prospect.get('title', '')}",
        f"Company: {prospect.get('company_name', '')}",
    ]

    if prospect.get("company_size"):
        lines.append(f"Size: ~{prospect['company_size']} employees")

    enrichment = prospect.get("enrichment", {})
    if enrichment.get("hiring_signals"):
        lines.append(f"Signals: {', '.join(enrichment['hiring_signals'][:3])}")

    if candidates:
        lines.append(f"\nMatched Candidates ({len(candidates)}):")
        for c in candidates[:3]:
            lines.append(
                f"  - {c['name']} | {c['experience_years']}yr | "
                f"Score {c['vetting_score']}/100"
            )

    if email_sequence and email_sequence.get("emails"):
        email_1 = email_sequence["emails"][0]
        lines.append(f"\nEmail Subject: {email_1.get('subject', '')}")
        body = email_1.get("body", "")
        preview = body[:300] + "..." if len(body) > 300 else body
        lines.append(f"\n{preview}")
        lines.append(f"\nFull sequence: {len(email_sequence['emails'])} emails")

    lines.append("\n--- END PREVIEW ---")
    return "\n".join(lines)


def format_batch_summary(batch_results):
    """Format a sending batch summary."""
    return (
        f"[Maya] Batch Complete\n\n"
        f"Sent: {batch_results.get('sent_count', 0)}\n"
        f"Failed: {batch_results.get('failed_count', 0)}\n"
        f"Bounced: {batch_results.get('bounced_count', 0)}"
    )


def format_daily_summary(state, daily_limit):
    """Format a daily outreach summary for Telegram."""
    leads = state.get("leads", [])
    status_counts = {}
    for lead in leads:
        s = lead.get("status", "unknown")
        status_counts[s] = status_counts.get(s, 0) + 1

    lines = [
        "[Maya] Daily Outreach Summary\n",
        f"Warmup day: {state.get('warmup_day', 0)} (limit: {daily_limit}/day)",
        f"Total leads: {len(leads)}",
    ]

    for status in ["new", "enriched", "queued", "sent", "replied", "bounced", "opted_out"]:
        count = status_counts.get(status, 0)
        if count > 0:
            lines.append(f"  {status}: {count}")

    lines.append(f"\nLifetime: {state.get('total_sent', 0)} sent, "
                 f"{state.get('total_replied', 0)} replied, "
                 f"{state.get('total_bounced', 0)} bounced")

    if state.get("total_sent", 0) > 0:
        reply_rate = state["total_replied"] / state["total_sent"] * 100
        lines.append(f"Reply rate: {reply_rate:.1f}%")

    return "\n".join(lines)


def format_weekly_report(snapshot, previous=None):
    """Format a weekly outreach metrics report."""
    lines = [
        "[Maya] Weekly Outreach Report\n",
        f"Week of: {snapshot.get('week_start', 'Unknown')}\n",
        f"Total sourced: {snapshot.get('total_sourced', 0)}",
        f"Total sent: {snapshot.get('total_sent', 0)}",
        f"Total replied: {snapshot.get('total_replied', 0)}",
        f"Total bounced: {snapshot.get('total_bounced', 0)}",
        f"Active sequences: {snapshot.get('active_leads', 0)}",
        f"\nReply rate: {snapshot.get('reply_rate', 0)}%",
        f"Bounce rate: {snapshot.get('bounce_rate', 0)}%",
    ]

    if previous:
        prev_reply = previous.get("reply_rate", 0)
        curr_reply = snapshot.get("reply_rate", 0)
        delta = curr_reply - prev_reply
        if abs(delta) >= 0.5:
            arrow = "\u2191" if delta > 0 else "\u2193"
            lines.append(f"Reply rate trend: {arrow} {abs(delta):.1f}% vs last week")

    return "\n".join(lines)


def format_followup_preview(lead, email):
    """Format a follow-up email preview."""
    return (
        f"--- FOLLOW-UP (Touch {email.get('step', '?')}) ---\n\n"
        f"To: {lead.get('name', '')} ({lead.get('email', '')})\n"
        f"Subject: {email.get('subject', '')}\n\n"
        f"{email.get('body', '')}\n\n"
        f"--- END ---"
    )


# ─── Candidate Research Formatters ────────────────────────────

def format_candidate_research_list(candidates):
    """Format a numbered list of Apollo candidates for Telegram review."""
    if not candidates:
        return "[Maya] No candidates found for this search."

    lines = [
        f"[Maya] Found {len(candidates)} candidates\n",
    ]

    for i, c in enumerate(candidates, 1):
        name = c.get("name", "Unknown")
        title = c.get("title", "")
        company = c.get("company", "")
        linkedin = c.get("linkedin_url", "")

        entry = f"{i}. {name}"
        if title:
            entry += f" — {title}"
        if company:
            entry += f" at {company}"
        lines.append(entry)

        if linkedin:
            lines.append(f"   {linkedin}")
        lines.append("")

    lines.append(
        "Review their profiles, then reply with the numbers "
        "you want to reach out to.\n"
        'Example: "1, 3, 5" or "all" or "none"'
    )

    return "\n".join(lines)


def format_targeted_search_list(searches):
    """Format Apollo-powered targeted LinkedIn search URLs for Telegram.

    Groups searches by company for easy scanning.
    """
    if not searches:
        return "[Maya] No targeted searches available."

    # Group by company
    companies = {}
    for s in searches:
        company = s.get("company", "Unknown")
        if company not in companies:
            companies[company] = {
                "industry": s.get("company_industry", ""),
                "size": s.get("company_size", 0),
                "city": s.get("company_city", ""),
                "linkedin": s.get("company_linkedin", ""),
                "searches": [],
            }
        companies[company]["searches"].append(s)

    lines = [
        f"[Maya] Found {len(companies)} companies with {len(searches)} candidate searches\n",
    ]

    idx = 1
    for company, info in companies.items():
        detail = company
        if info["industry"]:
            detail += f" ({info['industry']})"
        if info["size"]:
            detail += f" ~{info['size']} emp"
        if info["city"]:
            detail += f", {info['city']}"
        lines.append(detail)
        if info["linkedin"]:
            lines.append(f"  {info['linkedin']}")

        for s in info["searches"]:
            lines.append(f"  {idx}. {s['title']}")
            lines.append(f"     {s['search_url']}")
            idx += 1
        lines.append("")

    lines.append(
        "Open the searches above on LinkedIn. For each promising candidate,\n"
        "tap 'Draft Message' and I'll compose a personalized pitch.\n\n"
        'Type "done" when finished or "skip" to move on.'
    )

    return "\n".join(lines)


# ─── Candidate Recruitment Formatters ────────────────────────

def format_linkedin_candidate_preview(search_query, candidate, messages):
    """Format a LinkedIn candidate + recruitment message for Telegram approval."""
    lines = [
        "[Maya] LinkedIn Candidate\n",
        f"Search: \"{search_query}\"",
        f"Name: {candidate.get('name', 'Unknown')}",
    ]

    if candidate.get("title"):
        lines.append(f"Title: {candidate['title']}")
    if candidate.get("summary"):
        summary = candidate["summary"][:200] + "..." if len(candidate.get("summary", "")) > 200 else candidate.get("summary", "")
        lines.append(f"About: {summary}")
    if candidate.get("vertical"):
        lines.append(f"Vertical: {candidate['vertical']}")

    if messages:
        lines.append(f"\nConnection Note ({len(messages.get('connection_note', ''))} chars):")
        lines.append(f"---\n{messages.get('connection_note', '')}\n---")
        lines.append(f"\nFollow-up Message:")
        followup = messages.get("followup_message", "")
        preview = followup[:300] + "..." if len(followup) > 300 else followup
        lines.append(f"---\n{preview}\n---")

    return "\n".join(lines)


def format_reddit_candidate_preview(post, messages):
    """Format a Reddit candidate + reply draft for Telegram approval."""
    lines = [
        "[Maya] Reddit Candidate\n",
        f"Subreddit: r/{post.get('subreddit', '?')}",
        f"Author: u/{post.get('author', '?')}",
        f"Post: {post.get('title', '')}",
    ]

    text = post.get("text", "")
    if text:
        preview = text[:200] + "..." if len(text) > 200 else text
        lines.append(f"Body: {preview}")

    if post.get("url"):
        lines.append(f"Link: {post['url']}")
    if post.get("vertical"):
        lines.append(f"Vertical: {post['vertical']}")

    if messages:
        lines.append(f"\nPublic Comment:")
        lines.append(f"---\n{messages.get('comment', '')}\n---")
        lines.append(f"\nDirect Message:")
        lines.append(f"---\n{messages.get('dm', '')}\n---")

    return "\n".join(lines)


def format_candidate_daily_summary(candidate_stats, linkedin_activity, reddit_activity):
    """Format a daily candidate recruitment summary."""
    lines = [
        "[Maya] Daily Candidate Recruitment Summary\n",
    ]

    if linkedin_activity:
        lines.append("LinkedIn:")
        lines.append(f"  Companies found: {linkedin_activity.get('companies_found', 0)}")
        lines.append(f"  Searches generated: {linkedin_activity.get('searches_generated', 0)}")
        lines.append(f"  Messages drafted: {linkedin_activity.get('drafted', 0)}")
        lines.append(f"  Approved: {linkedin_activity.get('approved', 0)}")
        lines.append(f"  Queued for sending: {linkedin_activity.get('queued', 0)}")

    if reddit_activity:
        lines.append("\nReddit:")
        lines.append(f"  Posts found: {reddit_activity.get('posts_found', 0)}")
        lines.append(f"  Replies drafted: {reddit_activity.get('drafted', 0)}")
        lines.append(f"  Approved: {reddit_activity.get('approved', 0)}")

    lines.append(f"\nLifetime totals:")
    lines.append(f"  Candidates found: {candidate_stats.get('total_found', 0)}")
    lines.append(f"  Messages sent: {candidate_stats.get('total_messaged', 0)}")
    lines.append(f"  Responses: {candidate_stats.get('total_responded', 0)}")
    lines.append(f"  Applications: {candidate_stats.get('total_applied', 0)}")

    return "\n".join(lines)
