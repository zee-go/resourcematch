/**
 * External job fetchers for aggregating remote jobs from free APIs.
 * Supports Remotive and RemoteOK. Add new fetchers by implementing JobFetcher interface.
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

// ─── Shared Filters ──────────────────────────────────────────

/** Only keep jobs relevant to our two verticals */
const ACCOUNTING_KEYWORDS = [
  "accountant", "accounting", "bookkeeper", "bookkeeping",
  "finance", "financial", "cpa", "controller", "auditor", "audit",
  "tax", "payroll", "accounts payable", "accounts receivable",
  "quickbooks", "xero", "cfo", "treasury", "fiscal",
  "budget", "billing", "invoic", "ledger", "reconcili",
];

const OPS_KEYWORDS = [
  "operations manager", "operations director", "operations lead",
  "operations coordinator", "operations analyst", "operations associate",
  "operations specialist", "project manager", "program manager",
  "supply chain", "logistics", "fulfillment", "fulfilment",
  "inventory", "procurement", "warehouse",
  "ecommerce", "e-commerce", "shopify", "amazon",
  "business operations", "ops manager", "chief operating",
  "process improvement", "vendor management",
];

function classifyVertical(title: string, tags: string[]): Vertical | null {
  const text = [title, ...tags].join(" ").toLowerCase();
  if (ACCOUNTING_KEYWORDS.some((k) => text.includes(k))) return "accounting";
  if (OPS_KEYWORDS.some((k) => text.includes(k))) return "ecommerce";
  return null;
}

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
];

export const remotiveFetcher: JobFetcher = {
  name: "remotive",
  async fetch(): Promise<RawExternalJob[]> {
    const results = await Promise.allSettled(
      REMOTIVE_CATEGORIES.map(async (category) => {
        const url = `https://remotive.com/api/remote-jobs?category=${category}&limit=50`;
        const response = await fetch(url);

        if (!response.ok) {
          console.error(`Remotive fetch failed for ${category}: ${response.status}`);
          return [];
        }

        const data: RemotiveResponse = await response.json();
        const jobs: RawExternalJob[] = [];

        for (const job of data.jobs) {
          const location = job.candidate_required_location || "";
          if (!isLocationRelevant(location)) continue;

          const vertical = classifyVertical(job.title, job.tags);
          if (!vertical) continue;

          const publishedAt = job.publication_date
            ? new Date(job.publication_date)
            : new Date();
          const expiresAt = new Date(publishedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

          jobs.push({
            sourceId: String(job.id),
            sourceName: "remotive",
            sourceUrl: job.url,
            title: job.title,
            companyName: job.company_name,
            companyLogo: job.company_logo || null,
            description: job.description,
            vertical,
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

        return jobs;
      })
    );

    const allJobs: RawExternalJob[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allJobs.push(...result.value);
      }
    }

    return allJobs;
  },
};

// ─── RemoteOK API ────────────────────────────────────────────

interface RemoteOKJob {
  id: string;
  slug: string;
  url: string;
  apply_url: string;
  position: string;
  company: string;
  company_logo: string;
  date: string;
  epoch: number;
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  tags: string[];
}

export const remoteOKFetcher: JobFetcher = {
  name: "remoteok",
  async fetch(): Promise<RawExternalJob[]> {
    try {
      const response = await fetch("https://remoteok.com/api", {
        headers: { "User-Agent": "ResourceMatch/1.0" },
      });

      if (!response.ok) {
        console.error(`RemoteOK fetch failed: ${response.status}`);
        return [];
      }

      const data: RemoteOKJob[] = await response.json();

      // First element is API legal notice, skip it
      const jobs = Array.isArray(data) ? data.slice(1) : [];
      const result: RawExternalJob[] = [];

      for (const job of jobs) {
        if (!job.position || !job.company) continue;

        const location = job.location || "";
        if (!isLocationRelevant(location)) continue;

        const vertical = classifyVertical(job.position, job.tags || []);
        if (!vertical) continue;

        const publishedAt = job.date ? new Date(job.date) : new Date();
        const expiresAt = new Date(publishedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

        const salaryMin = job.salary_min && job.salary_min > 0 ? job.salary_min : null;
        const salaryMax = job.salary_max && job.salary_max > 0 ? job.salary_max : null;
        let salary: string | null = null;
        if (salaryMin && salaryMax) {
          salary = `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()}/yr`;
        } else if (salaryMin) {
          salary = `From $${salaryMin.toLocaleString()}/yr`;
        } else if (salaryMax) {
          salary = `Up to $${salaryMax.toLocaleString()}/yr`;
        }

        result.push({
          sourceId: String(job.id),
          sourceName: "remoteok",
          sourceUrl: job.url || `https://remoteok.com/remote-jobs/${job.slug}`,
          title: job.position,
          companyName: job.company,
          companyLogo: job.company_logo || null,
          description: job.description || "",
          vertical,
          jobType: null,
          availability: "FULL_TIME",
          location: location || "Remote",
          salary,
          salaryMin,
          salaryMax,
          skills: job.tags || [],
          category: null,
          publishedAt,
          expiresAt,
        });
      }

      return result;
    } catch (error) {
      console.error("RemoteOK fetch error:", error);
      return [];
    }
  },
};
