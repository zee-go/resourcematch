import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/server/middleware/withRateLimit";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerAuthSession(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  if (!company) {
    return res.status(404).json({ error: "Company profile not found" });
  }

  if (company.verificationStatus === "VERIFIED") {
    return res.status(200).json({ success: true, alreadyVerified: true });
  }

  // Require company website for AI verification
  if (!company.companyWebsite) {
    return res.status(400).json({
      error: "Company website is required for verification",
    });
  }

  if (!company.companyName) {
    return res.status(400).json({
      error: "Company name is required for verification",
    });
  }

  // Mark as pending
  await prisma.company.update({
    where: { id: company.id },
    data: { verificationStatus: "PENDING" },
  });

  // Fetch website content
  let websiteContent = "";
  try {
    const websiteUrl = company.companyWebsite.startsWith("http")
      ? company.companyWebsite
      : `https://${company.companyWebsite}`;
    const websiteRes = await fetch(websiteUrl, {
      headers: { "User-Agent": "ResourceMatch-Verifier/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (websiteRes.ok) {
      const html = await websiteRes.text();
      // Strip HTML tags, keep text content
      websiteContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 3000);
    } else {
      websiteContent = `[Website returned HTTP ${websiteRes.status}]`;
    }
  } catch {
    websiteContent = "[Website unreachable or timed out]";
  }

  // Build prompt for Claude
  const prompt = `You are a company verification analyst for ResourceMatch, a platform connecting international companies with senior Filipino professionals (5-10+ years experience).

Evaluate whether this company is legitimate and safe for professionals to engage with. Consider:
1. Is the website real and established? (not a placeholder, parked domain, or scam page)
2. Does the website content match the stated industry?
3. Does the email domain match the company website domain?
4. Are there any red flags? (free email providers like gmail/yahoo, suspicious patterns, very vague website)
5. How complete and credible is the company profile?

Company details:
- Name: ${company.companyName}
- Website: ${company.companyWebsite}
- Email: ${company.email}
- Industry: ${company.industry || "Not provided"}
- Size: ${company.companySize || "Not provided"}

Website content (first 3000 chars):
${websiteContent}

Return ONLY valid JSON with no markdown:
{
  "score": <number 0-100>,
  "passed": <boolean, true if score >= 70>,
  "summary": "<1-2 sentence assessment>",
  "details": ["<specific finding 1>", "<specific finding 2>"],
  "redFlags": ["<concern 1>"],
  "legitimacyIndicators": ["<positive signal 1>"]
}

Scoring guidelines:
- 90-100: Clearly established company with strong online presence
- 70-89: Legitimate company with reasonable verification signals
- 50-69: Some concerns but not definitively fraudulent
- Below 50: Significant red flags suggesting potential scam`;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "AI verification service not configured" });
    }

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("[VERIFY-AI] Claude API error:", errText);
      // Revert to unverified
      await prisma.company.update({
        where: { id: company.id },
        data: { verificationStatus: "UNVERIFIED" },
      });
      return res.status(500).json({ error: "AI verification service error" });
    }

    const aiData = await aiRes.json();
    const content = aiData.content?.[0]?.text;
    if (!content) {
      await prisma.company.update({
        where: { id: company.id },
        data: { verificationStatus: "UNVERIFIED" },
      });
      return res.status(500).json({ error: "No response from AI verification" });
    }

    const result = JSON.parse(content);

    // Update company with verification result
    const updateData = {
      verificationStatus: result.passed ? "VERIFIED" as const : "REJECTED" as const,
      verificationScore: result.score,
      verificationSummary: result.summary,
      verificationDetails: [
        ...result.details,
        ...(result.redFlags?.length ? [`Red flags: ${result.redFlags.join(", ")}`] : []),
        ...(result.legitimacyIndicators?.length
          ? [`Positive signals: ${result.legitimacyIndicators.join(", ")}`]
          : []),
      ],
      verifiedVia: "ai",
      verified: result.passed,
      verifiedAt: result.passed ? new Date() : null,
    };

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      verified: result.passed,
      score: result.score,
      summary: result.summary,
      details: result.details,
      redFlags: result.redFlags,
    });
  } catch (error) {
    console.error("[VERIFY-AI] Error:", error);
    await prisma.company.update({
      where: { id: company.id },
      data: { verificationStatus: "UNVERIFIED" },
    });
    return res.status(500).json({ error: "Verification failed" });
  }
}

export default withRateLimit({ limit: 3, windowSeconds: 3600 }, handler);
