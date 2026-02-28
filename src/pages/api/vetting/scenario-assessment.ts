import type { NextApiRequest, NextApiResponse } from "next";
import type {
  ScenarioGenerationRequest,
  ScenarioQuestion,
  APIResponse,
} from "@/lib/vetting-types";

const VERTICALS: Record<string, string> = {
  ecommerce: "E-commerce Operations",
  healthcare: "Healthcare Administration",
  accounting: "Accounting & Finance",
  marketing: "Digital Marketing",
};

function buildScenarioPrompt(
  vertical: string,
  experienceLevel: string,
  count: number
): string {
  const verticalName = VERTICALS[vertical] || vertical;

  return `You are an expert talent evaluator creating scenario-based assessment questions for senior Filipino professionals in the "${verticalName}" vertical. The candidate has ${experienceLevel} of experience.

Generate exactly ${count} realistic workplace scenario questions that test:
1. Domain expertise and technical knowledge
2. Problem-solving under pressure
3. Leadership and decision-making ability
4. Communication and stakeholder management

Each scenario should be specific to ${verticalName} and appropriate for a senior-level professional.

Return a JSON array with exactly this structure (no markdown, just raw JSON):
[
  {
    "id": "<unique id like 'scenario_1'>",
    "vertical": "${vertical}",
    "difficulty": "<one of: intermediate, advanced, expert>",
    "scenario": "<detailed scenario description, 2-4 sentences>",
    "evaluationCriteria": ["<what a good answer should include 1>", "<criteria 2>", "<criteria 3>"]
  }
]

Make scenarios realistic and based on common challenges in ${verticalName}. Vary difficulty levels.`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<ScenarioQuestion[]>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { vertical, experienceLevel, count = 3 } = req.body as ScenarioGenerationRequest;

  if (!vertical?.trim()) {
    return res.status(400).json({ success: false, error: "Vertical is required" });
  }

  if (!experienceLevel?.trim()) {
    return res.status(400).json({ success: false, error: "Experience level is required" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env.local",
    });
  }

  try {
    const prompt = buildScenarioPrompt(vertical, experienceLevel, count);

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

    const questions = JSON.parse(content) as ScenarioQuestion[];

    return res.status(200).json({ success: true, data: questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      error: `Failed to generate scenarios: ${message}`,
    });
  }
}
