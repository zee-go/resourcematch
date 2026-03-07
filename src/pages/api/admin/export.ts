import type { NextApiResponse } from "next";
import { withAdmin, type AuthenticatedRequest } from "@/server/middleware/withAuth";
import { withRateLimit } from "@/server/middleware/withRateLimit";
import { prisma } from "@/lib/prisma";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCsv).join(",");
  const dataLines = rows.map((row) => row.map(escapeCsv).join(","));
  return [headerLine, ...dataLines].join("\n");
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type } = req.query as Record<string, string>;

  try {
    let csv: string;
    let filename: string;

    switch (type) {
      case "companies": {
        const companies = await prisma.company.findMany({
          include: {
            user: { select: { email: true, createdAt: true } },
            _count: { select: { unlocks: true, jobs: true, creditPurchases: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        csv = toCsv(
          ["Company Name", "User Email", "Industry", "Verification Status", "Credits", "Subscription", "Unlocks", "Jobs", "Purchases", "Joined"],
          companies.map((c) => [
            c.companyName, c.user.email, c.industry || "", c.verificationStatus,
            String(c.credits), c.subscriptionTier || "None",
            String(c._count.unlocks), String(c._count.jobs), String(c._count.creditPurchases),
            new Date(c.createdAt).toISOString(),
          ]),
        );
        filename = "companies.csv";
        break;
      }

      case "candidates": {
        const candidates = await prisma.candidate.findMany({
          select: {
            name: true, fullName: true, title: true, email: true, phone: true,
            vertical: true, experience: true, availability: true, location: true,
            vettingScore: true, verified: true, skills: true, createdAt: true,
            _count: { select: { unlocks: true, jobApplications: true } },
          },
          orderBy: { vettingScore: "desc" },
        });
        csv = toCsv(
          ["Name", "Title", "Email", "Phone", "Vertical", "Experience", "Availability", "Location", "Vetting Score", "Verified", "Skills", "Unlocks", "Applications", "Created"],
          candidates.map((c) => [
            c.fullName || c.name, c.title, c.email || "", c.phone || "",
            c.vertical, String(c.experience), c.availability, c.location || "",
            c.vettingScore !== null ? String(c.vettingScore) : "", c.verified ? "Yes" : "No",
            c.skills.join("; "), String(c._count.unlocks), String(c._count.jobApplications),
            new Date(c.createdAt).toISOString(),
          ]),
        );
        filename = "candidates.csv";
        break;
      }

      case "applications": {
        const applications = await prisma.application.findMany({
          orderBy: { createdAt: "desc" },
        });
        csv = toCsv(
          ["Name", "Email", "Phone", "Vertical", "Experience", "Status", "Skills", "Bio", "LinkedIn", "Applied"],
          applications.map((a) => [
            a.fullName, a.email, a.phone || "", a.vertical, String(a.experience),
            a.status, a.skills.join("; "), a.bio || "", a.linkedInUrl || "",
            new Date(a.createdAt).toISOString(),
          ]),
        );
        filename = "applications.csv";
        break;
      }

      case "revenue": {
        const purchases = await prisma.creditPurchase.findMany({
          include: { company: { select: { companyName: true, email: true } } },
          orderBy: { createdAt: "desc" },
        });
        csv = toCsv(
          ["Company", "Company Email", "Type", "Credits", "Amount ($)", "Stripe Session ID", "Date"],
          purchases.map((p) => [
            p.company?.companyName || "", p.company?.email || "",
            p.type, String(p.credits), (p.amountCents / 100).toFixed(2),
            p.stripeSessionId || "", new Date(p.createdAt).toISOString(),
          ]),
        );
        filename = "revenue.csv";
        break;
      }

      case "jobs": {
        const jobs = await prisma.job.findMany({
          include: {
            company: { select: { companyName: true, email: true } },
            _count: { select: { applications: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        csv = toCsv(
          ["Title", "Company", "Vertical", "Status", "Availability", "Salary Min", "Salary Max", "Location", "Applications", "Published", "Closed", "Created"],
          jobs.map((j) => [
            j.title, j.company.companyName, j.vertical, j.status, j.availability,
            j.salaryMin !== null ? String(j.salaryMin) : "", j.salaryMax !== null ? String(j.salaryMax) : "",
            j.location || "", String(j._count.applications),
            j.publishedAt ? new Date(j.publishedAt).toISOString() : "",
            j.closedAt ? new Date(j.closedAt).toISOString() : "",
            new Date(j.createdAt).toISOString(),
          ]),
        );
        filename = "jobs.csv";
        break;
      }

      default:
        return res.status(400).json({ error: "Invalid export type. Use: companies, candidates, applications, revenue, jobs" });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    return res.status(200).send(csv);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Export failed: ${message}` });
  }
}

export default withRateLimit({ limit: 10, windowSeconds: 60 }, withAdmin(handler));
