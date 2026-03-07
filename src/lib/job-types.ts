export interface JobSummary {
  id: string;
  title: string;
  description: string;
  vertical: "ecommerce" | "accounting";
  experienceMin: number;
  experienceMax: number | null;
  availability: string;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string[];
  location: string | null;
  status: "DRAFT" | "OPEN" | "CLOSED";
  expiresAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  company: {
    id: string;
    companyName: string | null;
    verified: boolean;
    industry: string | null;
    companySize: string | null;
  };
  _count: {
    applications: number;
  };
}

export interface JobDetail extends JobSummary {
  updatedAt: string;
}

export interface JobApplicationData {
  id: string;
  coverLetter: string | null;
  status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED";
  createdAt: string;
  candidate: {
    id: number;
    name: string;
    fullName: string;
    title: string;
    avatar: string;
    vertical: string;
    experience: number;
    skills: string[];
    location: string;
    vettingScore: number;
    verified: boolean;
    summary: string;
  };
  isUnlocked: boolean;
  isVetted: boolean;
}

export interface CandidateApplicationData {
  id: string;
  coverLetter: string | null;
  status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED";
  createdAt: string;
  job: {
    id: string;
    title: string;
    vertical: string;
    availability: string;
    location: string | null;
    status: string;
    company: {
      companyName: string | null;
      verified: boolean;
    };
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── External / Unified Job Types ──────────────────────────

export interface ExternalJobSummary {
  id: string;
  title: string;
  description: string;
  vertical: "ecommerce" | "accounting" | null;
  availability: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salary: string | null;
  skills: string[];
  location: string | null;
  publishedAt: string | null;
  companyName: string;
  companyLogo: string | null;
  sourceName: string;
  sourceUrl: string;
  isExternal: true;
}

export interface NativeJobSummary extends JobSummary {
  isExternal: false;
}

export type UnifiedJobSummary = NativeJobSummary | ExternalJobSummary;
