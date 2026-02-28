import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Briefcase,
  Clock,
  ShieldCheck,
  Lock,
  Eye,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { Candidate } from "@/lib/candidates";
import { verticalLabels } from "@/lib/candidates";
import { UnlockModal } from "@/components/UnlockModal";

interface CandidateResultsProps {
  candidates: Candidate[];
  totalCount: number;
  matchScores?: Record<number, number>;
  aiMatchedIds?: number[];
}

export function CandidateResults({
  candidates,
  totalCount,
  matchScores = {},
  aiMatchedIds = [],
}: CandidateResultsProps) {
  const [unlockTarget, setUnlockTarget] = useState<Candidate | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);

  const isUnlocked = (id: number) => unlockedIds.includes(id);
  const isTopMatch = (id: number) => aiMatchedIds.includes(id);
  const getMatchScore = (id: number) => matchScores[id];

  const handleUnlockSuccess = (candidateId: number) => {
    setUnlockedIds((prev) => [...prev, candidateId]);
    setUnlockTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          {totalCount} Professional{totalCount !== 1 ? "s" : ""} Found
        </h2>
        <div className="text-sm text-slate-600">
          Showing {candidates.length} result{candidates.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {candidates.map((candidate, index) => {
          const unlocked = isUnlocked(candidate.id);
          const topMatch = isTopMatch(candidate.id);
          const matchScore = getMatchScore(candidate.id);

          return (
            <div
              key={candidate.id}
              className={`bg-white rounded-xl shadow-sm border-2 hover:shadow-md transition-all duration-300 overflow-hidden group ${
                topMatch
                  ? "border-[#D38B53] ring-2 ring-[#D38B53]/20"
                  : "border-slate-200"
              }`}
              style={{
                animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
              }}
            >
              {/* AI Match Badge */}
              {topMatch && (
                <div className="bg-gradient-to-r from-[#D38B53] to-[#B47646] px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      Top AI Match
                    </span>
                  </div>
                  {matchScore && (
                    <span className="text-white text-sm font-bold">
                      {matchScore}% Match
                    </span>
                  )}
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200"
                    />
                    {candidate.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate">
                          {unlocked ? candidate.fullName : candidate.name}
                        </h3>
                        <p className="text-sm text-slate-600 truncate">
                          {candidate.title}
                        </p>
                      </div>
                      {matchScore && !topMatch && (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 flex-shrink-0">
                          {matchScore}% Match
                        </Badge>
                      )}
                    </div>
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
                      {candidate.experience} years
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
                    <ShieldCheck className="w-4 h-4 text-[#04443C] mx-auto mb-1" />
                    <div className="text-xs text-slate-600">Vetting Score</div>
                    <div className="text-sm font-semibold text-[#04443C]">
                      {candidate.vettingScore}/100
                    </div>
                  </div>
                </div>

                {/* Vertical Badge */}
                <div className="mb-3">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs mb-2">
                    {verticalLabels[candidate.vertical]}
                  </Badge>
                </div>

                {/* Skills */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-slate-600 mb-2">
                    Key Skills
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

                {/* Case Study Preview */}
                {candidate.caseStudies.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <div className="text-xs font-medium text-slate-600 mb-1.5">
                      Featured Case Study
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {candidate.caseStudies[0].title}
                    </p>
                    {candidate.caseStudies[0].metrics && (
                      <p className="text-xs text-[#04443C] font-medium mt-1">
                        {candidate.caseStudies[0].metrics}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {unlocked ? (
                    <>
                      <Link href={`/profile/${candidate.id}`} className="flex-1">
                        <Button className="w-full bg-[#04443C] hover:bg-[#022C27] text-white">
                          View Full Profile
                        </Button>
                      </Link>
                      <Link href={`/profile/${candidate.id}`}>
                        <Button
                          variant="outline"
                          className="border-[#04443C] text-[#04443C] hover:bg-green-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => setUnlockTarget(candidate)}
                        className="flex-1 bg-[#D38B53] hover:bg-[#B47646] text-white"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Unlock (1 Credit)
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
            <SearchIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No professionals found
          </h3>
          <p className="text-slate-600 mb-6">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}

      {/* Unlock Modal */}
      {unlockTarget && (
        <UnlockModal
          isOpen={!!unlockTarget}
          onClose={() => setUnlockTarget(null)}
          candidate={{
            id: unlockTarget.id,
            name: unlockTarget.name,
            title: unlockTarget.title,
            avatar: unlockTarget.name.split(" ").map((n) => n[0]).join(""),
            vettingScore: unlockTarget.vettingScore,
          }}
          onUnlockSuccess={() => handleUnlockSuccess(unlockTarget.id)}
        />
      )}
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
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
