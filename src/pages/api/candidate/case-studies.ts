import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  if (req.method === "GET") {
    const caseStudies = await prisma.caseStudy.findMany({
      where: { candidateId: candidate.id },
      orderBy: { id: "asc" },
    });
    return res.status(200).json({ caseStudies });
  }

  if (req.method === "POST") {
    const { title, outcome, metrics } = req.body;
    if (!title?.trim() || !outcome?.trim()) {
      return res.status(400).json({ error: "Title and outcome are required" });
    }
    const count = await prisma.caseStudy.count({
      where: { candidateId: candidate.id },
    });
    if (count >= 5) {
      return res.status(400).json({ error: "Maximum 5 case studies allowed" });
    }
    const caseStudy = await prisma.caseStudy.create({
      data: {
        candidateId: candidate.id,
        title: title.trim(),
        outcome: outcome.trim(),
        metrics: metrics?.trim() || null,
      },
    });
    return res.status(201).json({ caseStudy });
  }

  if (req.method === "PUT") {
    const { id, title, outcome, metrics } = req.body;
    if (!id || !title?.trim() || !outcome?.trim()) {
      return res
        .status(400)
        .json({ error: "id, title, and outcome are required" });
    }
    const existing = await prisma.caseStudy.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.candidateId !== candidate.id) {
      return res.status(404).json({ error: "Case study not found" });
    }
    const updated = await prisma.caseStudy.update({
      where: { id: Number(id) },
      data: {
        title: title.trim(),
        outcome: outcome.trim(),
        metrics: metrics?.trim() || null,
      },
    });
    return res.status(200).json({ caseStudy: updated });
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id is required" });
    const existing = await prisma.caseStudy.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.candidateId !== candidate.id) {
      return res.status(404).json({ error: "Case study not found" });
    }
    await prisma.caseStudy.delete({ where: { id: Number(id) } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
