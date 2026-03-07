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
    const references = await prisma.reference.findMany({
      where: { candidateId: candidate.id },
      orderBy: { id: "asc" },
    });
    return res.status(200).json({ references });
  }

  if (req.method === "POST") {
    const { name, company, role, quote } = req.body;
    if (
      !name?.trim() ||
      !company?.trim() ||
      !role?.trim() ||
      !quote?.trim()
    ) {
      return res
        .status(400)
        .json({ error: "Name, company, role, and quote are required" });
    }
    const count = await prisma.reference.count({
      where: { candidateId: candidate.id },
    });
    if (count >= 5) {
      return res.status(400).json({ error: "Maximum 5 references allowed" });
    }
    const reference = await prisma.reference.create({
      data: {
        candidateId: candidate.id,
        name: name.trim(),
        company: company.trim(),
        role: role.trim(),
        quote: quote.trim(),
      },
    });
    return res.status(201).json({ reference });
  }

  if (req.method === "PUT") {
    const { id, name, company, role, quote } = req.body;
    if (
      !id ||
      !name?.trim() ||
      !company?.trim() ||
      !role?.trim() ||
      !quote?.trim()
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existing = await prisma.reference.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.candidateId !== candidate.id) {
      return res.status(404).json({ error: "Reference not found" });
    }
    // Reset verified when candidate edits a reference
    const updated = await prisma.reference.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        company: company.trim(),
        role: role.trim(),
        quote: quote.trim(),
        verified: false,
      },
    });
    return res.status(200).json({ reference: updated });
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id is required" });
    const existing = await prisma.reference.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.candidateId !== candidate.id) {
      return res.status(404).json({ error: "Reference not found" });
    }
    await prisma.reference.delete({ where: { id: Number(id) } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
