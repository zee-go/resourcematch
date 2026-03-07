import { prisma } from "@/lib/prisma";

const ENGLISH_SCORE_MAP: Record<string, number> = {
  basic: 40,
  intermediate: 60,
  advanced: 80,
  native: 95,
};

const PASSING_THRESHOLD = 70;
const TOTAL_LAYERS = 4;

/**
 * Recalculate a candidate's composite vetting score from their layer results.
 * Called after any VettingLayerResult is created/updated.
 *
 * Updates: Candidate.vettingScore, Candidate.englishScore (from video layer),
 * Candidate.verified (if all 4 layers pass), and VettingProfile.
 */
export async function recalculateVettingScore(
  candidateId: number
): Promise<void> {
  const layers = await prisma.vettingLayerResult.findMany({
    where: { candidateId },
  });

  if (layers.length === 0) return;

  const avgScore = Math.round(
    layers.reduce((sum, l) => sum + l.score, 0) / layers.length
  );

  const allComplete = layers.length === TOTAL_LAYERS;
  const allPassed =
    allComplete && layers.every((l) => l.score >= PASSING_THRESHOLD);

  const candidateUpdate: Record<string, unknown> = {
    vettingScore: avgScore,
  };

  if (allPassed) {
    candidateUpdate.verified = true;
    candidateUpdate.verifiedDate = new Date();
  }

  // Extract englishScore from video interview result
  const videoLayer = layers.find((l) => l.layer === "VIDEO_INTERVIEW");
  if (videoLayer?.resultJson) {
    const resultData = videoLayer.resultJson as Record<string, unknown>;
    const proficiency = resultData.englishProficiency as string | undefined;
    if (proficiency && ENGLISH_SCORE_MAP[proficiency] !== undefined) {
      candidateUpdate.englishScore = ENGLISH_SCORE_MAP[proficiency];
    }
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: candidateUpdate,
  });

  // Determine vetting profile status
  let status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" =
    "IN_PROGRESS";
  if (allComplete) {
    status = allPassed ? "COMPLETED" : "FAILED";
  }

  await prisma.vettingProfile.upsert({
    where: { candidateId },
    create: {
      candidateId,
      status,
      overallScore: avgScore,
      startedAt: new Date(),
      ...(allComplete ? { completedAt: new Date() } : {}),
    },
    update: {
      overallScore: avgScore,
      status,
      ...(allComplete ? { completedAt: new Date() } : {}),
    },
  });
}
