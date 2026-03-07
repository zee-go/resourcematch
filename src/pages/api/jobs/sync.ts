/**
 * Daily job sync endpoint.
 * Secured by Bearer token — called by GCP Cloud Scheduler.
 *
 * Setup:
 *   gcloud scheduler jobs create http job-sync \
 *     --schedule="0 6 * * *" \
 *     --time-zone="Asia/Manila" \
 *     --uri="https://resourcematch.ph/api/jobs/sync" \
 *     --http-method=POST \
 *     --headers="Authorization=Bearer <JOB_SYNC_SECRET>" \
 *     --location=asia-southeast1 \
 *     --attempt-deadline=600s
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { remotiveFetcher, remoteOKFetcher } from "@/lib/job-fetchers";
import type { JobFetcher } from "@/lib/job-fetchers";

const fetchers: JobFetcher[] = [remotiveFetcher, remoteOKFetcher];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.JOB_SYNC_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Job sync not configured" });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Invalid authorization" });
  }

  try {
    const stats = { fetched: 0, upserted: 0, expired: 0 };

    for (const fetcher of fetchers) {
      const jobs = await fetcher.fetch();
      stats.fetched += jobs.length;

      const seenSourceIds: string[] = [];

      for (const job of jobs) {
        seenSourceIds.push(job.sourceId);

        await prisma.externalJob.upsert({
          where: {
            sourceName_sourceId: {
              sourceName: job.sourceName,
              sourceId: job.sourceId,
            },
          },
          create: {
            sourceId: job.sourceId,
            sourceName: job.sourceName,
            sourceUrl: job.sourceUrl,
            title: job.title,
            companyName: job.companyName,
            companyLogo: job.companyLogo,
            description: job.description,
            vertical: job.vertical,
            jobType: job.jobType,
            availability: job.availability,
            location: job.location,
            salary: job.salary,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            skills: job.skills,
            category: job.category,
            publishedAt: job.publishedAt,
            expiresAt: job.expiresAt,
            status: "ACTIVE",
            lastSeenAt: new Date(),
          },
          update: {
            title: job.title,
            description: job.description,
            salary: job.salary,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            location: job.location,
            lastSeenAt: new Date(),
            status: "ACTIVE",
          },
        });
        stats.upserted++;
      }

      // Mark jobs from this source as EXPIRED if not seen for 7+ days
      const expireResult = await prisma.externalJob.updateMany({
        where: {
          sourceName: fetcher.name,
          status: "ACTIVE",
          sourceId: { notIn: seenSourceIds.length > 0 ? seenSourceIds : ["__none__"] },
          lastSeenAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        data: { status: "EXPIRED" },
      });
      stats.expired += expireResult.count;
    }

    // Expire jobs past their expiresAt date
    const dateExpired = await prisma.externalJob.updateMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lt: new Date() },
      },
      data: { status: "EXPIRED" },
    });
    stats.expired += dateExpired.count;

    const totalActive = await prisma.externalJob.count({
      where: { status: "ACTIVE" },
    });

    return res.status(200).json({
      success: true,
      stats: { ...stats, totalActive },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Job sync failed:", message);
    return res.status(500).json({ error: `Job sync failed: ${message}` });
  }
}
