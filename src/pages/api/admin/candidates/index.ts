import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { search, vertical, page = "1", limit = "20" } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: Prisma.CandidateWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (vertical && vertical !== "all") {
    where.vertical = vertical as Prisma.EnumVerticalFilter;
  }

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      select: {
        id: true, name: true, fullName: true, title: true, vertical: true,
        experience: true, availability: true, skills: true, vettingScore: true,
        verified: true, email: true, phone: true, location: true, createdAt: true,
        vettingProfile: { select: { status: true, overallScore: true } },
        vettingLayers: { select: { layer: true, score: true, passed: true } },
        _count: { select: { unlocks: true, jobApplications: true } },
      },
      orderBy: { vettingScore: "desc" },
      skip,
      take,
    }),
    prisma.candidate.count({ where }),
  ]);

  return res.status(200).json({
    data: JSON.parse(JSON.stringify(candidates)),
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
  });
}

export default withRateLimit({ limit: 30, windowSeconds: 60 }, withAdmin(handler));
