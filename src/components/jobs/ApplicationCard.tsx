import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Unlock,
  ExternalLink,
  Briefcase,
  MapPin,
} from "lucide-react";
import type { JobApplicationData } from "@/lib/job-types";

interface ApplicationCardProps {
  application: JobApplicationData;
  onStatusChange: (applicationId: string, status: string) => void;
  onUnlock: (candidateId: number) => void;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function ApplicationCard({
  application,
  onStatusChange,
  onUnlock,
}: ApplicationCardProps) {
  const { candidate } = application;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-4">
        {/* Candidate Info */}
        <div className="flex items-start gap-3 flex-1">
          <img
            src={candidate.avatar}
            alt={candidate.name}
            className="w-10 h-10 rounded-full bg-slate-200"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-slate-900">
                {candidate.fullName}
              </span>
              {application.isVetted ? (
                <Badge className="bg-light text-primary text-xs gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  AI-Vetted ({candidate.vettingScore})
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Unvetted
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600">{candidate.title}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {candidate.experience} yrs
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {candidate.location}
              </span>
            </div>
            {/* Skills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {candidate.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
            {/* Cover letter preview */}
            {application.coverLetter && (
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
                &ldquo;{application.coverLetter}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* Status */}
          <Badge className={statusColors[application.status] || ""}>
            {application.status}
          </Badge>

          {/* Status change */}
          <Select
            value={application.status}
            onValueChange={(status) =>
              onStatusChange(application.id, status)
            }
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWED">Reviewed</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Unlock / View Profile */}
          <div className="flex gap-1">
            {application.isUnlocked ? (
              <Link href={`/profile/${candidate.id}`}>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Profile
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 border-primary text-primary"
                onClick={() => onUnlock(candidate.id)}
              >
                <Unlock className="w-3 h-3 mr-1" />
                Unlock Contact
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
