import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Briefcase,
  Clock,
  DollarSign,
  Lock,
  Eye,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Candidate {
  id: number;
  name: string;
  title: string;
  avatar: string;
  experience: string;
  availability: string;
  hourlyRate: number;
  skills: string[];
  location: string;
  rating: number;
  completedProjects: number;
}

interface CandidateResultsProps {
  candidates: Candidate[];
  totalCount: number;
}

export function CandidateResults({
  candidates,
  totalCount,
}: CandidateResultsProps) {
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);

  const unlockCandidate = (id: number) => {
    setUnlockedIds([...unlockedIds, id]);
  };

  const isUnlocked = (id: number) => unlockedIds.includes(id);

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          {totalCount} Candidate{totalCount !== 1 ? "s" : ""} Found
        </h2>
        <div className="text-sm text-slate-600">
          Showing {candidates.length} result{candidates.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {candidates.map((candidate, index) => {
          const unlocked = isUnlocked(candidate.id);

          return (
            <div
              key={candidate.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 overflow-hidden group"
              style={{
                animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
              }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate">
                      {unlocked ? candidate.name : "••••• •••••"}
                    </h3>
                    <p className="text-sm text-slate-600 truncate">
                      {candidate.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{unlocked ? candidate.location : "Philippines"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-medium">{candidate.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <Briefcase className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                    <div className="text-xs text-slate-600">Experience</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {candidate.experience}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <Clock className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                    <div className="text-xs text-slate-600">Availability</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {candidate.availability}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <DollarSign className="w-4 h-4 text-[#2D5F3F] mx-auto mb-1" />
                    <div className="text-xs text-slate-600">Hourly Rate</div>
                    <div className="text-sm font-semibold text-[#2D5F3F]">
                      ${candidate.hourlyRate}/hr
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">
                    Top Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.slice(0, 4).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-200">
                  <Briefcase className="w-4 h-4" />
                  <span>
                    {candidate.completedProjects} completed project
                    {candidate.completedProjects !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {unlocked ? (
                    <>
                      <Link href={`/profile/${candidate.id}`} className="flex-1">
                        <Button className="w-full bg-[#2D5F3F] hover:bg-[#1a3a26] text-white">
                          View Full Profile
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-[#2D5F3F] text-[#2D5F3F] hover:bg-green-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => unlockCandidate(candidate.id)}
                        className="flex-1 bg-[#D97642] hover:bg-[#c26638] text-white"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Unlock for $3
                      </Button>
                      <Link href={`/profile/${candidate.id}`}>
                        <Button
                          variant="outline"
                          className="border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                          Preview
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {candidates.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No candidates found
          </h3>
          <p className="text-slate-600 mb-6">
            Try adjusting your filters or search criteria
          </p>
          <Button
            variant="outline"
            className="border-[#2D5F3F] text-[#2D5F3F] hover:bg-green-50"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}

function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}