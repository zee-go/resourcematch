/**
 * External job fetchers for aggregating remote jobs from free APIs.
 * Currently supports Remotive. Add new fetchers by implementing JobFetcher interface.
 */

import type { Vertical, Availability } from "@prisma/client";

export interface RawExternalJob {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  title: string;
  companyName: string;
  companyLogo: string | null;
  description: string;
  vertical: Vertical | null;
  jobType: string | null;
  availability: Availability | null;
  location: string | null;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string[];
  category: string | null;
  publishedAt: Date | null;
  expiresAt: Date;
}

export interface JobFetcher {
  name: string;
  fetch(): Promise<RawExternalJob[]>;
}

// ─── Category → Vertical Mapping ────────────────────────────

const REMOTIVE_CATEGORY_MAP: Record<string, Vertical> = {
  "finance-legal": "accounting",
  "business": "ecommerce",
  "marketing": "ecommerce",
  "project-management": "ecommerce",
  "customer-support": "ecommerce",
};

// ─── Job Type → Availability Mapping ─────────────────────────

function mapJobType(jobType: string | undefined): Availability | null {
  if (!jobType) return null;
  const lower = jobType.toLowerCase();
  if (lower.includes("full")) return "FULL_TIME";
  if (lower.includes("part")) return "PART_TIME";
  if (lower.includes("contract") || lower.includes("freelance")) return "CONTRACT";
  return null;
}

// ─── Remotive API ────────────────────────────────────────────

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string | null;
  category: string;
  job_type: string;
  candidate_required_location: string;
  salary: string;
  description: string;
  publication_date: string;
  tags: string[];
}

interface RemotiveResponse {
  "job-count": number;
  jobs: RemotiveJob[];
}

const REMOTIVE_CATEGORIES = [
  "business",
  "finance-legal",
  "marketing",
  "customer-support",
  "project-management",
];

function isLocationRelevant(location: string): boolean {
  if (!location) return true;
  const lower = location.toLowerCase();
  return (
    lower.includes("philippines") ||
    lower.includes("worldwide") ||
    lower.includes("anywhere") ||
    lower.includes("asia") ||
    lower === ""
  );
}

export const remotiveFetcher: JobFetcher = {
  name: "remotive",
  async fetch(): Promise<RawExternalJob[]> {
    const allJobs: RawExternalJob[] = [];

    for (let i = 0; i < REMOTIVE_CATEGORIES.length; i++) {
      const category = REMOTIVE_CATEGORIES[i];
      try {
        const url = `https://remotive.com/api/remote-jobs?category=${category}&limit=50`;
        const response = await fetch(url);

        if (!response.ok) {
          console.error(`Remotive fetch failed for ${category}: ${response.status}`);
          continue;
        }

        const data: RemotiveResponse = await response.json();

        for (const job of data.jobs) {
          const location = job.candidate_required_location || "";
          if (!isLocationRelevant(location)) continue;

          const publishedAt = job.publication_date
            ? new Date(job.publication_date)
            : new Date();
          const expiresAt = new Date(publishedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

          allJobs.push({
            sourceId: String(job.id),
            sourceName: "remotive",
            sourceUrl: job.url,
            title: job.title,
            companyName: job.company_name,
            companyLogo: job.company_logo || null,
            description: job.description,
            vertical: REMOTIVE_CATEGORY_MAP[job.category] || null,
            jobType: job.job_type || null,
            availability: mapJobType(job.job_type),
            location: location || "Remote",
            salary: job.salary || null,
            salaryMin: null,
            salaryMax: null,
            skills: job.tags || [],
            category: job.category,
            publishedAt,
            expiresAt,
          });
        }
      } catch (error) {
        console.error(`Remotive fetch error for ${category}:`, error);
      }

      // Respect Remotive rate limit: 2 req/min
      if (i < REMOTIVE_CATEGORIES.length - 1) {
        await new Promise((r) => setTimeout(r, 31000));
      }
    }

    return allJobs;
  },
};
