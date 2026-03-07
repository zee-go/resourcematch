import type { NextApiResponse } from "next";
import type {
  ReferenceCheckRequest,
  ReferenceCheckResult,
  APIResponse,
} from "@/lib/vetting-types";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";
import { recalculateVettingScore } from "@/server/utils/recalculate-vetting";

const VERTICALS: Record<string, string> = {
  ecommerce: "Operations Management",
  accounting: "Finance & Accounting",
};

function buildReferenceCheckPrompt(data: ReferenceCheckRequest): string {
  const verticalName = VERTICALS[data.targetVertical] || data.targetVertical;

  const referenceSummaries = data.references
    .map(
      (ref, i) =>
        `Reference ${i + 1}:
- Name: ${ref.name}
- Company: ${ref.company}
- Role: ${ref.role}
- Relationship: ${ref.relationship}
- Rating: ${ref.rating}/5
- Verified: ${ref.verified ? "Yes" : "No"}
- Feedback: ${ref.feedback}`
    )
    .join("\n\n");

  return `You are an expert talent evaluator for a platform that connects companies with senior Filipino professionals. Analyze the following reference checks for a candidate being evaluated for the "${verticalName}" vertical.

REFERENCES:
${referenceSummaries}

Analyze all references and return a JSON object with exactly this structure (no markdown, just raw JSON):
{
  "score": <number 0-100>,
  "passed": <boolean, true if score >= 70>,
  "summary": "<1-2 sentence overall assessment of reference feedback>",
  "details": ["<key finding 1>", "<key finding 2>", "<key finding 3>"],
  "referencesVerified": <number of references marked as verified>,
  "referencesAttempted": <total number of references>,
  "averageRating": <average of all reference ratings, rounded to 1 decimal>,
  "highlights": ["<standout positive feedback 1>", "<standout positive feedback 2>", "<any concern or inconsistency>"]
}

Scoring guidelines:
- 90-100: All references verified, consistently excellent feedback (4.5+ avg), strong vertical relevance
- 80-89: Most references verified, positive feedback (4.0+ avg), good consistency
- 70-79: Majority verified, generally positive (3.5+ avg), minor inconsistencies
- 60-69: Some unverified, mixed feedback, or notable inconsistencies
- Below 60: Multiple unverified, negative feedback, or significant red flags

Look for:
- Consistency across references (do they tell the same story?)
- Specificity of feedback (vague praise vs concrete examples)
- Relevance to the ${verticalName} vertical
- Red flags: reluctant references, contradictions, overly generic feedback
- Strength of relationships (direct manager vs distant colleague)`;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<ReferenceCheckResult>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = req.body as ReferenceCheckRequest;

  if (!body.references?.length) {
    return res.status(400).json({ success: false, error: "At least one reference is required" });
  }

  if (!body.targetVertical?.trim()) {
    return res.status(400).json({ success: false, error: "Target vertical is required" });
  }

  if (!body.candidateId) {
    return res.status(400).json({ success: false, error: "Candidate ID is required" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env.local",
    });
  }

  try {
    const prompt = buildReferenceCheckPrompt(body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        success: false,
        error: `Anthropic API error: ${response.status} ${errorText}`,
      });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return res.status(500).json({
        success: false,
        error: "No response from AI model",
      });
    }

    const analysisResult = JSON.parse(content) as Omit<ReferenceCheckResult, "layer">;

    const result: ReferenceCheckResult = {
      ...analysisResult,
      layer: "reference_check",
      completedAt: new Date().toISOString(),
    };

    // Persist to database
    await prisma.vettingLayerResult.upsert({
      where: {
        candidateId_layer: {
          candidateId: body.candidateId,
          layer: "REFERENCE_CHECK",
        },
      },
      create: {
        candidateId: body.candidateId,
        layer: "REFERENCE_CHECK",
        score: result.score,
        passed: result.passed,
        summary: result.summary,
        details: result.details,
        resultJson: JSON.parse(JSON.stringify(result)),
        completedAt: new Date(),
      },
      update: {
        score: result.score,
        passed: result.passed,
        summary: result.summary,
        details: result.details,
        resultJson: JSON.parse(JSON.stringify(result)),
        completedAt: new Date(),
      },
    });

    await recalculateVettingScore(body.candidateId);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      error: `Failed to check references: ${message}`,
    });
  }
}

export default withRateLimit(
  { limit: 10, windowSeconds: 60 },
  withAdmin(handler)
);
