import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Briefcase,
  Users,
  ShieldCheck,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { UnifiedJobSummary, NativeJobSummary, ExternalJobSummary } from "@/lib/job-types";

interface JobCardProps {
  job: UnifiedJobSummary;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
  if (min) return `From $${min.toLocaleString()}/mo`;
  return `Up to $${max!.toLocaleString()}/mo`;
}

const verticalLabels: Record<string, string> = {
  ecommerce: "Operations Management",
  accounting: "Finance & Accounting",
};

const availabilityLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
};

const sourceLabels: Record<string, string> = {
  remotive: "Remotive",
  adzuna: "Adzuna",
};

/** Extract display-friendly values from either job type */
function getJobDisplay(job: UnifiedJobSummary) {
  if (job.isExternal) {
    const ext = job as ExternalJobSummary;
    return {
      href: `/jobs/ext/${ext.id}`,
      companyName: ext.companyName,
      verified: false,
      sourceName: ext.sourceName,
      rawSalary: ext.salary,
      experienceMin: null as number | null,
      experienceMax: null as number | null,
      applicationCount: null as number | null,
      isExternal: true as const,
    };
  }
  const native = job as NativeJobSummary;
  return {
    href: `/jobs/${native.id}`,
    companyName: native.company.companyName || "Company",
    verified: native.company.verified,
    sourceName: null as string | null,
    rawSalary: null as string | null,
    experienceMin: native.experienceMin as number | null,
    experienceMax: native.experienceMax,
    applicationCount: native._count.applications as number | null,
    isExternal: false as const,
  };
}

export function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const d = getJobDisplay(job);

  return (
    <Link href={d.href}>
      <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <span>{d.companyName}</span>
              {d.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              )}
            </div>
          </div>
          {d.isExternal && d.sourceName && (
            <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 bg-amber-50 shrink-0 ml-2">
              <ExternalLink className="w-3 h-3 mr-1" />
              {sourceLabels[d.sourceName] || d.sourceName}
            </Badge>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {job.vertical && (
            <Badge
              variant="secondary"
              className="bg-light text-primary text-xs"
            >
              {verticalLabels[job.vertical] || job.vertical}
            </Badge>
          )}
          {job.availability && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {availabilityLabels[job.availability] || job.availability}
            </Badge>
          )}
          {d.experienceMin != null && (
            <Badge variant="outline" className="text-xs">
              <Briefcase className="w-3 h-3 mr-1" />
              {d.experienceMin}
              {d.experienceMax ? `-${d.experienceMax}` : "+"} yrs
            </Badge>
          )}
        </div>

        {/* Description preview */}
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {job.description}
        </p>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-0.5 text-slate-400 text-xs">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.location}
              </span>
            )}
            {salary && (
              <span className="text-primary font-medium">{salary}</span>
            )}
            {d.isExternal && !salary && d.rawSalary && (
              <span className="text-primary font-medium">{d.rawSalary}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {d.applicationCount != null && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {d.applicationCount} applied
              </span>
            )}
            {job.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatTimeAgo(job.publishedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
