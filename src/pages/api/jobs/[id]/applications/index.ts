import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyNewApplication } from "@/lib/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: jobId } = req.query;
  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ error: "Job ID is required" });
  }

  if (req.method === "GET") {
    return handleGet(jobId, req, res);
  }

  if (req.method === "POST") {
    return handlePost(jobId, req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// GET: Company views applicants for their job
async function handleGet(
  jobId: string,
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

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.companyId !== company.id) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const applications = await prisma.jobApplication.findMany({
    where: { jobId },
    include: {
      candidate: {
        select: {
          id: true,
          name: true,
          fullName: true,
          title: true,
          avatar: true,
          vertical: true,
          experience: true,
          skills: true,
          location: true,
          vettingScore: true,
          verified: true,
          summary: true,
        },
      },
    },
    orderBy: [
      // Vetted candidates first
      { candidate: { vettingScore: "desc" } },
      { createdAt: "desc" },
    ],
  });

  // Check unlock status for each candidate
  const candidateIds = applications
    .map((a) => a.candidateId)
    .filter((id): id is number => id !== null);

  const unlocks = await prisma.unlock.findMany({
    where: {
      companyId: company.id,
      candidateId: { in: candidateIds },
    },
    select: { candidateId: true },
  });

  const unlockedSet = new Set(unlocks.map((u) => u.candidateId));

  const data = applications.map((app) => ({
    ...app,
    isUnlocked: unlockedSet.has(app.candidateId),
    isVetted: app.candidate.vettingScore > 0,
  }));

  return res.status(200).json({
    data: JSON.parse(JSON.stringify(data)),
  });
}

// POST: Candidate applies to a job
async function handlePost(
  jobId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession(req, res);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Must be a candidate
  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
  });

  if (!candidate) {
    return res
      .status(403)
      .json({ error: "Candidate profile required to apply" });
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: {
        select: { email: true, companyName: true },
      },
    },
  });

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.status !== "OPEN") {
    return res.status(400).json({ error: "This job is no longer accepting applications" });
  }

  // Check expiration
  if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
    return res.status(400).json({ error: "This job posting has expired" });
  }

  // Check for duplicate application
  const existing = await prisma.jobApplication.findUnique({
    where: {
      jobId_candidateId: {
        jobId,
        candidateId: candidate.id,
      },
    },
  });

  if (existing) {
    return res.status(409).json({ error: "You have already applied to this job" });
  }

  const { coverLetter } = req.body;

  const application = await prisma.jobApplication.create({
    data: {
      jobId,
      candidateId: candidate.id,
      coverLetter: coverLetter?.trim() || null,
    },
  });

  // Send email notification to company (fire-and-forget)
  notifyNewApplication(
    job.company.email,
    candidate.fullName,
    job.title,
    job.id
  );

  return res.status(201).json({
    application: JSON.parse(JSON.stringify(application)),
  });
}
