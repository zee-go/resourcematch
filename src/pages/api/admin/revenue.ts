import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, page = "1", limit = "20" } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Prisma.CreditPurchaseWhereInput = {};
  if (type && type !== "all") {
    where.type = type as Prisma.EnumPurchaseTypeFilter;
  }

  const [purchases, total, summary, activeSubscriptions] = await Promise.all([
    prisma.creditPurchase.findMany({
      where,
      include: { company: { select: { companyName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.creditPurchase.count({ where }),
    prisma.creditPurchase.aggregate({
      _sum: { amountCents: true, credits: true },
    }),
    prisma.company.count({ where: { subscriptionStatus: "ACTIVE" } }),
  ]);

  return res.status(200).json({
    data: JSON.parse(JSON.stringify(purchases)),
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
    summary: {
      totalRevenueCents: summary._sum.amountCents ?? 0,
      totalCreditsSold: summary._sum.credits ?? 0,
      activeSubscriptions,
    },
  });
}

export default withRateLimit({ limit: 30, windowSeconds: 60 }, withAdmin(handler));
