import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const [
    totalUsers,
    totalCompanies,
    totalCandidates,
    totalRevenue,
    activeJobs,
    pendingApplications,
    recentSignups,
    activeSubscriptions,
    totalUnlocks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.candidate.count(),
    prisma.creditPurchase.aggregate({ _sum: { amountCents: true } }),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, email: true, role: true, createdAt: true, name: true },
    }),
    prisma.company.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.unlock.count(),
  ]);

  const companiesByVerification = await prisma.company.groupBy({
    by: ["verificationStatus"],
    _count: { id: true },
  });

  const verificationBreakdown: Record<string, number> = {};
  for (const row of companiesByVerification) {
    verificationBreakdown[row.verificationStatus] = row._count.id;
  }

  return res.status(200).json({
    totalUsers,
    totalCompanies,
    totalCandidates,
    totalRevenueCents: totalRevenue._sum.amountCents ?? 0,
    activeJobs,
    pendingApplications,
    recentSignups: JSON.parse(JSON.stringify(recentSignups)),
    activeSubscriptions,
    totalUnlocks,
    companiesByVerification: verificationBreakdown,
  });
}

export default withRateLimit({ limit: 30, windowSeconds: 60 }, withAdmin(handler));
