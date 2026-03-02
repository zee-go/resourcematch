import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Briefcase,
  Users,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import type { JobSummary } from "@/lib/job-types";

interface JobCardProps {
  job: JobSummary;
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
  ecommerce: "E-commerce",
  accounting: "Accounting & Finance",
};

const availabilityLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
};

export function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <span>{job.company.companyName || "Company"}</span>
              {job.company.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge
            variant="secondary"
            className="bg-green-50 text-[#04443C] text-xs"
          >
            {verticalLabels[job.vertical] || job.vertical}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {availabilityLabels[job.availability] || job.availability}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Briefcase className="w-3 h-3 mr-1" />
            {job.experienceMin}
            {job.experienceMax ? `-${job.experienceMax}` : "+"} yrs
          </Badge>
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
              <span className="text-[#04443C] font-medium">{salary}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {job._count.applications} applied
            </span>
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
