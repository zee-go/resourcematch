import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Job ID is required" });
  }

  if (req.method === "GET") {
    return handleGet(id, res);
  }

  if (req.method === "PUT") {
    return handlePut(id, req, res);
  }

  if (req.method === "DELETE") {
    return handleDelete(id, req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(id: string, res: NextApiResponse) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          verified: true,
          industry: true,
          companySize: true,
        },
      },
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  return res.status(200).json({ job: JSON.parse(JSON.stringify(job)) });
}

async function handlePut(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  if (!company) {
    return res.status(403).json({ error: "Company profile required" });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.companyId !== company.id) {
    return res.status(403).json({ error: "Not authorized to edit this job" });
  }

  const {
    title,
    description,
    vertical,
    availability,
    experienceMin,
    experienceMax,
    salaryMin,
    salaryMax,
    skills,
    location,
    status,
    expiresInDays,
  } = req.body;

  const updateData: Record<string, unknown> = {};

  if (title !== undefined) updateData.title = title.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (vertical !== undefined) updateData.vertical = vertical;
  if (availability !== undefined) updateData.availability = availability;
  if (experienceMin !== undefined)
    updateData.experienceMin = parseInt(experienceMin);
  if (experienceMax !== undefined)
    updateData.experienceMax = experienceMax ? parseInt(experienceMax) : null;
  if (salaryMin !== undefined)
    updateData.salaryMin = salaryMin ? parseInt(salaryMin) : null;
  if (salaryMax !== undefined)
    updateData.salaryMax = salaryMax ? parseInt(salaryMax) : null;
  if (skills !== undefined) updateData.skills = skills;
  if (location !== undefined) updateData.location = location?.trim() || "Remote";

  // Handle status transitions
  if (status !== undefined && status !== job.status) {
    updateData.status = status;
    if (status === "OPEN" && job.status === "DRAFT") {
      updateData.publishedAt = new Date();
      const days = parseInt(expiresInDays) || 90;
      updateData.expiresAt = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
      );
    } else if (status === "CLOSED") {
      updateData.closedAt = new Date();
    } else if (status === "OPEN" && job.status === "CLOSED") {
      // Republish
      updateData.publishedAt = new Date();
      updateData.closedAt = null;
      const days = parseInt(expiresInDays) || 90;
      updateData.expiresAt = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
      );
    }
  }

  const updated = await prisma.job.update({
    where: { id },
    data: updateData,
    include: {
      company: {
        select: {
          companyName: true,
          verified: true,
        },
      },
    },
  });

  return res.status(200).json({ job: JSON.parse(JSON.stringify(updated)) });
}

async function handleDelete(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  if (!company) {
    return res.status(403).json({ error: "Company profile required" });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.companyId !== company.id) {
    return res.status(403).json({ error: "Not authorized to delete this job" });
  }

  // Soft-delete by closing; hard delete only if draft
  if (job.status === "DRAFT") {
    await prisma.job.delete({ where: { id } });
  } else {
    await prisma.job.update({
      where: { id },
      data: { status: "CLOSED", closedAt: new Date() },
    });
  }

  return res.status(200).json({ success: true });
}
