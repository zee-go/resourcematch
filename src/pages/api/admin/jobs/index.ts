import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { search, status, vertical, page = "1", limit = "20" } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Prisma.JobWhereInput = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { company: { companyName: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (status && status !== "all") {
    where.status = status as Prisma.EnumJobStatusFilter;
  }
  if (vertical && vertical !== "all") {
    where.vertical = vertical as Prisma.EnumVerticalFilter;
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: { select: { companyName: true, email: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.job.count({ where }),
  ]);

  return res.status(200).json({
    data: JSON.parse(JSON.stringify(jobs)),
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
  });
}

export default withRateLimit({ limit: 30, windowSeconds: 60 }, withAdmin(handler));
