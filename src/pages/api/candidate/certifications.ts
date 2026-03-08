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
    const certifications = await prisma.certification.findMany({
      where: { candidateId: candidate.id },
      orderBy: { id: "asc" },
    });
    return res.status(200).json({ certifications });
  }

  if (req.method === "POST") {
    const { title, issuingBody, issuedDate, expiryDate, credentialUrl } =
      req.body;
    if (!title?.trim() || !issuingBody?.trim()) {
      return res
        .status(400)
        .json({ error: "Title and issuing body are required" });
    }
    const count = await prisma.certification.count({
      where: { candidateId: candidate.id },
    });
    if (count >= 10) {
      return res
        .status(400)
        .json({ error: "Maximum 10 certifications allowed" });
    }
    const certification = await prisma.certification.create({
      data: {
        candidateId: candidate.id,
        title: title.trim(),
        issuingBody: issuingBody.trim(),
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialUrl: credentialUrl?.trim() || null,
      },
    });
    return res.status(201).json({ certification });
  }

  if (req.method === "PUT") {
    const { id, title, issuingBody, issuedDate, expiryDate, credentialUrl } =
      req.body;
    if (!id || !title?.trim() || !issuingBody?.trim()) {
      return res
        .status(400)
        .json({ error: "id, title, and issuing body are required" });
    }
    const existing = await prisma.certification.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.candidateId !== candidate.id) {
      return res.status(404).json({ error: "Certification not found" });
    }
    const updated = await prisma.certification.update({
      where: { id: Number(id) },
      data: {
        title: title.trim(),
        issuingBody: issuingBody.trim(),
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialUrl: credentialUrl?.trim() || null,
      },
    });
    return res.status(200).json({ certification: updated });
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id is required" });
    const existing = await prisma.certification.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.candidateId !== candidate.id) {
      return res.status(404).json({ error: "Certification not found" });
    }
    await prisma.certification.delete({ where: { id: Number(id) } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
