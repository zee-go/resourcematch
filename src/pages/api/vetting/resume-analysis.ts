import type { NextApiResponse } from "next";
import type {
  ResumeAnalysisRequest,
  ResumeAnalysisResult,
  APIResponse,
} from "@/lib/vetting-types";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";

const VERTICALS: Record<string, string> = {
  ecommerce: "E-commerce Operations",
  healthcare: "Healthcare Administration",
  accounting: "Accounting & Finance",
  marketing: "Digital Marketing",
};

function buildResumeAnalysisPrompt(
  resumeText: string,
  targetVertical: string
): string {
  const verticalName = VERTICALS[targetVertical] || targetVertical;

  return `You are an expert talent evaluator for a platform that connects companies with senior Filipino professionals. Analyze the following resume for a candidate being evaluated for the "${verticalName}" vertical.

RESUME:
${resumeText}

Evaluate the candidate and return a JSON object with exactly this structure (no markdown, just raw JSON):
{
  "score": <number 0-100>,
  "passed": <boolean, true if score >= 70>,
  "summary": "<1-2 sentence overall assessment>",
  "details": ["<key finding 1>", "<key finding 2>", "<key finding 3>"],
  "experienceYears": <estimated total years of relevant experience>,
  "relevantExperience": ["<relevant role/achievement 1>", "<relevant role/achievement 2>"],
  "redFlags": ["<concern 1>", "<concern 2>"],
  "verticalFit": {
    "score": <number 0-100>,
    "reasoning": "<why they fit or don't fit this vertical>"
  },
  "careerTrajectory": "<one of: ascending, lateral, declining, mixed>",
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>"]
}

Scoring guidelines:
- 90-100: Exceptional candidate, strong vertical fit, 10+ years experience
- 80-89: Strong candidate, good vertical fit, 7+ years experience
- 70-79: Solid candidate, reasonable vertical fit, 5+ years experience
- 60-69: Below threshold, some gaps or concerns
- Below 60: Does not meet senior talent requirements

Be rigorous but fair. Focus on concrete evidence from the resume.`;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<ResumeAnalysisResult>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { resumeText, targetVertical } = req.body as ResumeAnalysisRequest;

  if (!resumeText?.trim()) {
    return res.status(400).json({ success: false, error: "Resume text is required" });
  }

  if (!targetVertical?.trim()) {
    return res.status(400).json({ success: false, error: "Target vertical is required" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env.local",
    });
  }

  try {
    const prompt = buildResumeAnalysisPrompt(resumeText, targetVertical);

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
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
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

    // Parse the JSON response from Claude
    const analysisResult = JSON.parse(content) as Omit<ResumeAnalysisResult, "layer">;

    const result: ResumeAnalysisResult = {
      ...analysisResult,
      layer: "resume_analysis",
      completedAt: new Date().toISOString(),
    };

    // Persist to database if candidateId provided
    const { candidateId } = req.body as ResumeAnalysisRequest;
    if (candidateId) {
      await prisma.vettingLayerResult.upsert({
        where: {
          candidateId_layer: {
            candidateId,
            layer: "RESUME_ANALYSIS",
          },
        },
        create: {
          candidateId,
          layer: "RESUME_ANALYSIS",
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
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      error: `Failed to analyze resume: ${message}`,
    });
  }
}

export default withRateLimit(
  { limit: 10, windowSeconds: 60 },
  withAdmin(handler)
);
