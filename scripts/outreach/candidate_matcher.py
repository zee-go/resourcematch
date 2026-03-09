"""Candidate matcher — queries ResourceMatch DB to find candidates matching a prospect's needs.

Connects directly to PostgreSQL since this is a Python script, not part of the Next.js app.
Uses the prospect's vertical, hiring signals, and company context to find relevant matches.
"""

import logging

import psycopg2
import psycopg2.extras

from scripts.outreach.config import get_database_url

logger = logging.getLogger(__name__)


def _get_connection():
    """Create a PostgreSQL connection using the DATABASE_URL."""
    return psycopg2.connect(get_database_url())


def find_matching_candidates(prospect, limit=3):
    """Find top candidates matching a prospect's likely needs.

    Args:
        prospect: dict with company_industry, enrichment, segment, vertical hints
        limit: max candidates to return

    Returns:
        List of candidate dicts with name, title, experience, skills, vetting_score, vertical
    """
    # Determine target vertical from prospect signals
    vertical = _infer_vertical(prospect)

    try:
        conn = _get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Query verified candidates with high vetting scores in the target vertical
        query = """
            SELECT
                c.name,
                c.title,
                c.experience,
                c.skills,
                c.tools,
                c.vetting_score,
                c.vertical,
                c.availability,
                c.summary,
                c.verified,
                (
                    SELECT COUNT(*)
                    FROM case_studies cs
                    WHERE cs.candidate_id = c.id
                ) as case_study_count,
                (
                    SELECT COUNT(*)
                    FROM certifications cert
                    WHERE cert.candidate_id = c.id
                ) as certification_count,
                (
                    SELECT COUNT(*)
                    FROM references ref
                    WHERE ref.candidate_id = c.id AND ref.verified = true
                ) as verified_reference_count
            FROM candidates c
            WHERE c.verified = true
              AND c.vetting_score >= 70
        """
        params = []

        if vertical:
            query += " AND c.vertical = %s"
            params.append(vertical)

        query += " ORDER BY c.vetting_score DESC, c.experience DESC LIMIT %s"
        params.append(limit)

        cur.execute(query, params)
        candidates = cur.fetchall()
        cur.close()
        conn.close()

        # Format candidates for use in email personalization
        return [_format_candidate(c) for c in candidates]

    except Exception as e:
        logger.error("Database query failed: %s", e)
        return []


def _infer_vertical(prospect):
    """Infer the target vertical from prospect data."""
    enrichment = prospect.get("enrichment", {})
    signal_vertical = enrichment.get("signal_vertical")

    if signal_vertical:
        return signal_vertical

    # Infer from prospect's title or segment
    title = prospect.get("title", "").lower()
    segment = prospect.get("segment", "")

    accounting_signals = [
        "finance", "accounting", "controller", "cfo", "bookkeep",
        "payroll", "tax", "audit",
    ]
    ops_signals = [
        "operations", "ecommerce", "e-commerce", "coo", "supply chain",
        "logistics", "fulfillment", "procurement",
    ]

    if any(s in title for s in accounting_signals) or segment == "finance_leaders":
        return "accounting"
    if any(s in title for s in ops_signals) or segment == "ops_leaders":
        return "ecommerce"

    # Default: return None (query across all verticals)
    return None


def _format_candidate(row):
    """Format a database row into a prospect-friendly candidate summary."""
    skills = row.get("skills", [])
    tools = row.get("tools", [])

    return {
        "name": row["name"],
        "title": row["title"],
        "experience_years": row["experience"],
        "vetting_score": row["vetting_score"],
        "vertical": row["vertical"],
        "availability": row["availability"],
        "top_skills": skills[:5] if skills else [],
        "top_tools": tools[:3] if tools else [],
        "summary": row.get("summary", ""),
        "case_studies": row.get("case_study_count", 0),
        "certifications": row.get("certification_count", 0),
        "verified_references": row.get("verified_reference_count", 0),
    }
