import type { NextApiResponse } from "next";
import type {
  VideoInterviewRequest,
  VideoInterviewResult,
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

function buildVideoInterviewPrompt(data: VideoInterviewRequest): string {
  const verticalName = VERTICALS[data.targetVertical] || data.targetVertical;

  return `You are an expert talent evaluator for a platform that connects companies with senior Filipino professionals. Evaluate the following video interview notes for a candidate being assessed for the "${verticalName}" vertical.

INTERVIEW NOTES:
${data.interviewNotes}

INTERVIEWER RATINGS:
- Communication: ${data.communicationRating}/10
- Professionalism: ${data.professionalismRating}/10
- English Level (interviewer assessment): ${data.englishLevel}

Evaluate the candidate's video interview performance and return a JSON object with exactly this structure (no markdown, just raw JSON):
{
  "score": <number 0-100>,
  "passed": <boolean, true if score >= 70>,
  "summary": "<1-2 sentence overall assessment of interview performance>",
  "details": ["<key observation 1>", "<key observation 2>", "<key observation 3>"],
  "communicationScore": <number 0-100>,
  "professionalismScore": <number 0-100>,
  "englishProficiency": "<one of: basic, intermediate, advanced, native>",
  "notes": ["<specific note about communication style>", "<note about domain knowledge demonstrated>", "<note about cultural fit/professionalism>"]
}

Scoring guidelines:
- 90-100: Outstanding communicator, highly professional, native-level English
- 80-89: Strong communicator, professional, advanced English
- 70-79: Good communicator, professional, intermediate+ English
- 60-69: Adequate but some concerns in communication or professionalism
- Below 60: Significant communication or professionalism issues

Consider the interviewer's ratings but form your own assessment based on the notes. Focus on how well the candidate would represent themselves to international clients.`;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<VideoInterviewResult>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = req.body as VideoInterviewRequest;

  if (!body.interviewNotes?.trim()) {
    return res.status(400).json({ success: false, error: "Interview notes are required" });
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
    const prompt = buildVideoInterviewPrompt(body);

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

    const analysisResult = JSON.parse(content) as Omit<VideoInterviewResult, "layer">;

    const result: VideoInterviewResult = {
      ...analysisResult,
      layer: "video_interview",
      completedAt: new Date().toISOString(),
    };

    // Persist to database
    await prisma.vettingLayerResult.upsert({
      where: {
        candidateId_layer: {
          candidateId: body.candidateId,
          layer: "VIDEO_INTERVIEW",
        },
      },
      create: {
        candidateId: body.candidateId,
        layer: "VIDEO_INTERVIEW",
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
      error: `Failed to evaluate video interview: ${message}`,
    });
  }
}

export default withRateLimit(
  { limit: 10, windowSeconds: 60 },
  withAdmin(handler)
);
