import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerAuthSession(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!candidate) {
    return res.status(404).json({ error: "Candidate profile not found" });
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { candidateId: candidate.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            vertical: true,
            availability: true,
            location: true,
            status: true,
            company: {
              select: {
                companyName: true,
                verified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.jobApplication.count({
      where: { candidateId: candidate.id },
    }),
  ]);

  return res.status(200).json({
    data: applications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
