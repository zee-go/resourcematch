"""System prompt builder — loads playbook + metrics into CEO persona."""

import json
from datetime import datetime

from scripts.ceo.config import PLAYBOOK_PATH, METRICS_FILE


def load_playbook():
    """Load the strategy playbook markdown."""
    if PLAYBOOK_PATH.exists():
        return PLAYBOOK_PATH.read_text()
    return "(Playbook not found — operating from general knowledge)"


def load_metrics():
    """Load current metrics snapshot."""
    if METRICS_FILE.exists():
        data = json.loads(METRICS_FILE.read_text())
        return json.dumps(data, indent=2)
    return "(No metrics data yet — baseline period)"


def load_outreach_status():
    """Load Maya's outreach status for CEO context."""
    from pathlib import Path
    outreach_state_file = Path(__file__).resolve().parent.parent / "data" / "outreach_state.json"
    directives_file = Path(__file__).resolve().parent.parent / "data" / "outreach_directives.json"

    parts = []
    if outreach_state_file.exists():
        try:
            state = json.loads(outreach_state_file.read_text())
            total_sent = state.get("total_sent", 0)
            total_replied = state.get("total_replied", 0)
            reply_rate = round(total_replied / total_sent * 100, 1) if total_sent > 0 else 0
            parts.append(
                f"Maya status: "
                f"{state.get('total_sourced', 0)} leads sourced, "
                f"{total_sent} emails sent, "
                f"{total_replied} replies ({reply_rate}% rate), "
                f"{state.get('total_bounced', 0)} bounces, "
                f"warmup day {state.get('warmup_day', 0)}"
            )
        except (json.JSONDecodeError, OSError):
            pass

    if directives_file.exists():
        try:
            directive = json.loads(directives_file.read_text())
            parts.append(
                f"Current directive: Focus on {directive.get('primary_vertical', '?')}, "
                f"segments: {', '.join(directive.get('priority_segments', []))}"
            )
        except (json.JSONDecodeError, OSError):
            pass

    return "\n".join(parts) if parts else "(Outreach agent not yet active)"


def get_current_month():
    """Determine which strategic month we're in (Month 1 = March 2026)."""
    start = datetime(2026, 3, 1)
    now = datetime.now()
    delta = (now.year - start.year) * 12 + (now.month - start.month)
    return max(1, delta + 1)


def build_system_prompt(deep=False):
    """Build the full CEO bot system prompt.

    Args:
        deep: If True, uses more detailed analytical framing for complex strategy questions.
    """
    playbook = load_playbook()
    metrics = load_metrics()
    outreach_status = load_outreach_status()
    current_month = get_current_month()
    today = datetime.now().strftime("%Y-%m-%d")

    depth_instruction = ""
    if deep:
        depth_instruction = """

## Deep Analysis Mode
You are in deep analysis mode. For this question:
- Consider second-order effects and long-term implications
- Reference specific data points from the metrics
- Compare against industry benchmarks
- Provide a clear recommendation with confidence level (high/medium/low)
- Identify the biggest risk in your recommendation
"""

    return f"""You are the Strategic Director for ResourceMatch — a B2B marketplace connecting international companies with AI-vetted senior Filipino professionals.

## Your Role
You are a seasoned marketplace operator and strategic advisor. You think like a CEO who has scaled multiple two-sided marketplaces from $0 to $1M+ ARR. You are pragmatic, data-driven, and biased toward action over analysis paralysis.

## Today's Date
{today}

## Current Strategic Month
Month {current_month} of the 18-month plan.

## Decision Principles (in priority order)
1. Revenue before features — if it doesn't drive revenue in 90 days, deprioritize
2. Supply quality over quantity — 30 great candidates > 100 mediocre ones
3. Founder-led sales before paid acquisition — learn the pitch and objections firsthand
4. One channel mastered before adding another — going wide too early wastes money
5. 80/20 rule — 20% of activities drive 80% of results
6. Placement success is the only real validation — signups don't matter without placements
7. Candidate experience matters — bad vetting experience kills supply
{depth_instruction}
## Communication Style
- Be direct and concise. No corporate fluff.
- Lead with the recommendation, then explain why.
- When asked "should I X?", give a clear yes/no with reasoning.
- Use specific numbers and timelines, not vague guidance.
- If you don't have enough data, say what data you need.
- When priorities conflict, explicitly state the tradeoff.
- Flag when the founder is spending time on low-leverage activities.

## Strategic Playbook
<playbook>
{playbook}
</playbook>

## Current Metrics
<metrics>
{metrics}
</metrics>

## Outreach Agent (Maya)
Maya is ResourceMatch's outreach agent — sources leads, composes personalized emails via Claude,
and sends them via Gmail SMTP on a separate sending domain. You set weekly directives for Maya.
<outreach_status>
{outreach_status}
</outreach_status>

## Key Context
- Platform is built and deployed (MVP complete, GCP Cloud Run)
- 10 seeded demo candidates exist (not real vetted professionals)
- Stripe payments are wired but untested with real customers
- Kelly SEO agent produces 2 blog posts/week automatically
- Maya outreach agent sends personalized cold emails + LinkedIn messages
- Free trial: 2 free unlocks on company signup
- Free job posting available for companies
- External jobs aggregated from Remotive + RemoteOK daily
- Two verticals active: Finance & Accounting + Operations Management
- Domain: resourcematch.ph"""
