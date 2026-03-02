import type { NextApiResponse } from "next";
import type {
  ScenarioEvaluationRequest,
  ScenarioEvaluationResult,
  APIResponse,
} from "@/lib/vetting-types";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";

const VERTICALS: Record<string, string> = {
  ecommerce: "Operations Management",
  accounting: "Accounting & Finance",
};

function buildEvaluationPrompt(data: ScenarioEvaluationRequest): string {
  const verticalName = VERTICALS[data.targetVertical] || data.targetVertical;

  const criteriaList = data.evaluationCriteria
    .map((c, i) => `${i + 1}. ${c}`)
    .join("\n");

  return `You are an expert talent evaluator for senior Filipino professionals in the "${verticalName}" vertical. Evaluate the following candidate response to a scenario question.

SCENARIO:
${data.scenario}

EVALUATION CRITERIA:
${criteriaList}

CANDIDATE'S RESPONSE:
${data.response}

Evaluate the response and return a JSON object with exactly this structure (no markdown, just raw JSON):
{
  "score": <number 0-100>,
  "passed": <boolean, true if score >= 70>,
  "summary": "<1-2 sentence assessment of the response quality>",
  "details": ["<key observation 1>", "<key observation 2>"],
  "questionId": "${data.questionId}",
  "strengthsShown": ["<strength demonstrated 1>", "<strength demonstrated 2>"],
  "areasForImprovement": ["<area for improvement 1>", "<area for improvement 2>"],
  "criteriaScores": [
    ${data.evaluationCriteria.map((c) => `{"criterion": "${c}", "score": <0-100>, "feedback": "<specific feedback>"}`).join(",\n    ")}
  ]
}

Scoring guidelines:
- 90-100: Exceptional response demonstrating deep expertise and leadership
- 80-89: Strong response with good domain knowledge and problem-solving
- 70-79: Adequate response covering most criteria
- 60-69: Partial response with gaps in knowledge or approach
- Below 60: Weak response missing key criteria

Be specific in your feedback. Reference concrete parts of the candidate's response.`;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<ScenarioEvaluationResult>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = req.body as ScenarioEvaluationRequest;

  if (!body.scenario?.trim()) {
    return res.status(400).json({ success: false, error: "Scenario is required" });
  }

  if (!body.response?.trim()) {
    return res.status(400).json({ success: false, error: "Candidate response is required" });
  }

  if (!body.evaluationCriteria?.length) {
    return res.status(400).json({ success: false, error: "Evaluation criteria are required" });
  }

  if (!body.targetVertical?.trim()) {
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
    const prompt = buildEvaluationPrompt(body);

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

    const evaluationResult = JSON.parse(content) as Omit<ScenarioEvaluationResult, "layer">;

    const result: ScenarioEvaluationResult = {
      ...evaluationResult,
      layer: "scenario_evaluation",
      completedAt: new Date().toISOString(),
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      error: `Failed to evaluate response: ${message}`,
    });
  }
}

export default withRateLimit(
  { limit: 10, windowSeconds: 60 },
  withAdmin(handler)
);
