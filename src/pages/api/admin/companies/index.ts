import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    search,
    verificationStatus,
    subscriptionTier,
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Prisma.CompanyWhereInput = {};
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (verificationStatus && verificationStatus !== "all") {
    where.verificationStatus = verificationStatus as Prisma.EnumCompanyVerificationStatusFilter;
  }
  if (subscriptionTier && subscriptionTier !== "all") {
    where.subscriptionTier = subscriptionTier as Prisma.EnumSubscriptionTierNullableFilter;
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        user: { select: { email: true, createdAt: true, role: true, name: true } },
        _count: { select: { unlocks: true, jobs: true, creditPurchases: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.company.count({ where }),
  ]);

  return res.status(200).json({
    data: JSON.parse(JSON.stringify(companies)),
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
  });
}

export default withRateLimit({ limit: 30, windowSeconds: 60 }, withAdmin(handler));
