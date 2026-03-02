import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyApplicationStatusChange } from "@/lib/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id: jobId, applicationId } = req.query;
  if (!jobId || !applicationId) {
    return res.status(400).json({ error: "Job ID and Application ID are required" });
  }

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

  // Verify job ownership
  const job = await prisma.job.findUnique({
    where: { id: jobId as string },
    select: { companyId: true, title: true, company: { select: { companyName: true } } },
  });

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.companyId !== company.id) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const { status } = req.body;
  const validStatuses = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const application = await prisma.jobApplication.update({
    where: { id: applicationId as string },
    data: { status },
    include: {
      candidate: {
        select: { email: true, fullName: true },
      },
    },
  });

  // Notify candidate of status change (fire-and-forget)
  if (application.candidate.email && status !== "PENDING") {
    notifyApplicationStatusChange(
      application.candidate.email,
      job.title,
      job.company.companyName || "A company",
      status
    );
  }

  return res.status(200).json({
    application: JSON.parse(JSON.stringify(application)),
  });
}
