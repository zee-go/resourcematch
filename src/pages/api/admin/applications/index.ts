import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Prisma.ApplicationWhereInput = {};
  if (status && status !== "all") {
    where.status = status as Prisma.EnumApplicationStatusFilter;
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.application.count({ where }),
  ]);

  return res.status(200).json({
    data: JSON.parse(JSON.stringify(applications)),
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
  });
}

export default withRateLimit({ limit: 30, windowSeconds: 60 }, withAdmin(handler));
