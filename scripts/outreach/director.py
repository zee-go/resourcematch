"""Director — Maya asks the CEO bot for weekly outreach directives.

Flow:
1. Maya calls get_weekly_directive() at the start of each run
2. CEO bot analyzes playbook + metrics + outreach history → returns a directive
3. Directive is shown to the user on Telegram for approval
4. Approved directive guides Maya's lead sourcing, targeting, and messaging

The directive includes:
- Target segments to focus on this week
- Target vertical emphasis (accounting vs ecommerce)
- Weekly goals (number of prospects, emails, meetings)
- Messaging guidance (angles to try, objections to address)
- Any strategic context the CEO bot thinks is relevant
"""

import json
import logging

import anthropic

from scripts.ceo.config import get_anthropic_key, DEFAULT_MODEL
from scripts.ceo.system_prompt import build_system_prompt
from scripts.outreach.state import get_state
from scripts.outreach.metrics import get_current_stats

logger = logging.getLogger(__name__)

DIRECTIVES_FILE = None  # Lazy import to avoid circular


def _get_directives_file():
    from pathlib import Path
    return Path(__file__).resolve().parent.parent / "data" / "outreach_directives.json"


def get_weekly_directive():
    """Ask the CEO bot what Maya should focus on this week.

    Returns a directive dict with targeting and messaging guidance.
    """
    client = anthropic.Anthropic(api_key=get_anthropic_key())
    system = build_system_prompt()

    # Build outreach context for the CEO bot
    outreach_context = _build_outreach_context()

    prompt = f"""You are advising Maya, ResourceMatch's outreach agent, on what to focus on this week.

OUTREACH STATUS:
{outreach_context}

IMPORTANT CONTEXT: ResourceMatch currently has limited real vetted candidates. Maya's PRIMARY job
right now is candidate recruitment — finding senior Filipino professionals on LinkedIn and Reddit
and driving them to apply at resourcematch.ph/apply. Company outreach activates automatically
once 5 real vetted candidates exist.

Based on the strategic playbook, current metrics, and outreach performance:

1. Which vertical should be the primary focus for candidate recruitment? (accounting or operations)
2. What candidate profiles should Maya prioritize? (e.g., CPAs, QuickBooks experts, Shopify specialists)
3. What's the weekly candidate recruitment goal? (LinkedIn connections to make, Reddit posts to engage)
4. Any specific messaging angles for recruiting candidates?
5. If company outreach is active: What ICP segments to target? (hiring_managers, finance_leaders, ops_leaders, founders)

Return your response as JSON:
{{
    "priority_segments": ["segment1", "segment2"],
    "primary_vertical": "accounting" or "operations",
    "weekly_goals": {{
        "candidates_to_find": 10,
        "linkedin_connections": 10,
        "reddit_engagements": 5,
        "prospects_to_source": 15,
        "emails_to_send": 30,
        "meetings_target": 2
    }},
    "candidate_focus": "Description of ideal candidate profiles to target this week",
    "messaging_guidance": "One paragraph on the angle/approach for candidate recruitment",
    "target_industries": ["industry1", "industry2"],
    "avoid": ["anything to avoid this week"],
    "strategic_context": "Brief strategic reasoning for these choices"
}}"""

    try:
        response = client.messages.create(
            model=DEFAULT_MODEL,
            max_tokens=2000,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )

        content = response.content[0].text

        # Extract JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        directive = json.loads(content.strip())
        directive["generated_at"] = __import__("datetime").datetime.now().isoformat()

        # Save directive to file
        _save_directive(directive)

        logger.info("Weekly directive received from CEO bot")
        return directive

    except Exception as e:
        logger.error("Failed to get CEO directive: %s", e)
        return _default_directive()


def _build_outreach_context():
    """Build a context string about Maya's current outreach status for the CEO bot."""
    state = get_state()
    stats = get_current_stats()

    # Candidate recruitment stats
    from scripts.outreach.state import get_candidate_stats
    cand_stats = get_candidate_stats()

    lines = [
        "--- Candidate Recruitment ---",
        f"Candidates found: {cand_stats.get('total_found', 0)}",
        f"Messages sent: {cand_stats.get('total_messaged', 0)}",
        f"Responses: {cand_stats.get('total_responded', 0)}",
        f"Applications received: {cand_stats.get('total_applied', 0)}",
        "",
        "--- Company Outreach ---",
        f"Total leads sourced: {stats.get('total_sourced', 0)}",
        f"Total emails sent: {stats.get('total_sent', 0)}",
        f"Total replies: {stats.get('total_replied', 0)}",
        f"Reply rate: {stats.get('reply_rate', 0)}%",
        f"Bounce rate: {stats.get('bounce_rate', 0)}%",
        f"Active sequences: {stats.get('active_sequences', 0)}",
        f"Warmup day: {stats.get('warmup_day', 0)}",
    ]

    # Segment breakdown
    segment_counts = {}
    for lead in state.get("leads", []):
        seg = lead.get("segment", "unknown")
        segment_counts[seg] = segment_counts.get(seg, 0) + 1
    if segment_counts:
        lines.append(f"\nLeads by segment: {json.dumps(segment_counts)}")

    # Recent replies
    replied = [l for l in state.get("leads", []) if l.get("replied")]
    if replied:
        lines.append(f"\nRecent replies ({len(replied)}):")
        for r in replied[-5:]:
            lines.append(f"  - {r.get('name', '?')} at {r.get('company_name', '?')} ({r.get('segment', '?')})")

    # Previous directive summary
    prev = get_current_directive()
    if prev:
        lines.append(f"\nLast week's directive: Focus on {prev.get('primary_vertical', '?')}, "
                     f"segments: {', '.join(prev.get('priority_segments', []))}")
        goals = prev.get("weekly_goals", {})
        lines.append(f"Last week's goals: {goals.get('emails_to_send', '?')} emails, "
                     f"{goals.get('meetings_target', '?')} meetings")

    return "\n".join(lines)


def _default_directive():
    """Fallback directive if CEO bot is unavailable."""
    return {
        "priority_segments": ["hiring_managers", "finance_leaders"],
        "primary_vertical": "accounting",
        "weekly_goals": {
            "candidates_to_find": 10,
            "linkedin_connections": 10,
            "reddit_engagements": 5,
            "prospects_to_source": 10,
            "emails_to_send": 20,
            "meetings_target": 1,
        },
        "candidate_focus": (
            "Senior Filipino accountants and bookkeepers with 5+ years experience. "
            "Prioritize CPAs, QuickBooks/Xero specialists, and financial analysts."
        ),
        "messaging_guidance": (
            "Lead with the level-up pitch: get AI-vetted and stand out to international "
            "companies. Emphasize it's free for candidates and senior-only (no VA marketplace)."
        ),
        "target_industries": ["fintech", "e-commerce", "professional services"],
        "avoid": [],
        "strategic_context": "Default directive — CEO bot was unavailable.",
    }


def _save_directive(directive):
    """Save the current directive to disk."""
    directives_file = _get_directives_file()
    directives_file.parent.mkdir(parents=True, exist_ok=True)
    directives_file.write_text(json.dumps(directive, indent=2))


def get_current_directive():
    """Read the current saved directive, if any."""
    directives_file = _get_directives_file()
    try:
        if directives_file.exists():
            return json.loads(directives_file.read_text())
    except (json.JSONDecodeError, OSError):
        pass
    return None


def format_directive_for_telegram(directive):
    """Format a directive as a readable Telegram message for user approval."""
    segments = ", ".join(directive.get("priority_segments", []))
    goals = directive.get("weekly_goals", {})

    lines = [
        "[Maya] Weekly Plan from Strategic Director\n",
        f"Focus vertical: {directive.get('primary_vertical', 'mixed')}",
        f"Target segments: {segments}",
        "",
        "Candidate recruitment goals:",
        f"  Candidates to find: {goals.get('candidates_to_find', '?')}",
        f"  LinkedIn connections: {goals.get('linkedin_connections', '?')}",
        f"  Reddit engagements: {goals.get('reddit_engagements', '?')}",
        "",
        "Company outreach goals:",
        f"  Prospects to source: {goals.get('prospects_to_source', '?')}",
        f"  Emails to send: {goals.get('emails_to_send', '?')}",
        f"  Meeting target: {goals.get('meetings_target', '?')}",
    ]

    candidate_focus = directive.get("candidate_focus", "")
    if candidate_focus:
        lines.append(f"\nCandidate focus:\n{candidate_focus}")

    industries = directive.get("target_industries", [])
    if industries:
        lines.append(f"\nTarget industries: {', '.join(industries)}")

    avoid = directive.get("avoid", [])
    if avoid:
        lines.append(f"Avoid: {', '.join(avoid)}")

    guidance = directive.get("messaging_guidance", "")
    if guidance:
        lines.append(f"\nMessaging angle:\n{guidance}")

    context = directive.get("strategic_context", "")
    if context:
        lines.append(f"\nReasoning:\n{context}")

    return "\n".join(lines)
