import { useState, useEffect } from "react";
import type { GetServerSideProps } from "next";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AIBanner } from "@/components/dashboard/AIBanner";
import { AIMatchModal, MatchFormData } from "@/components/dashboard/AIMatchModal";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { CandidateResults } from "@/components/dashboard/CandidateResults";
import { MatchingPreferences } from "@/components/dashboard/MatchingPreferences";
import { useAuth } from "@/contexts/AuthProvider";
import { Gift, X } from "lucide-react";
import { trackSearch, trackFilter, trackAIMatchOpen, trackAIMatchComplete } from "@/lib/analytics";
import type { Candidate } from "@/lib/candidates";
import { availabilityLabels, LAYER_KEY_MAP } from "@/lib/candidates";

interface DashboardProps {
  candidates: Candidate[];
}

export const getServerSideProps: GetServerSideProps<DashboardProps> = async () => {
  try {
    const { prisma } = await import("@/lib/prisma");
    const dbCandidates = await prisma.candidate.findMany({
      select: {
        id: true,
        name: true,
        fullName: true,
        title: true,
        avatar: true,
        vertical: true,
        experience: true,
        availability: true,
        skills: true,
        tools: true,
        location: true,
        summary: true,
        vettingScore: true,
        verified: true,
        caseStudies: {
          select: { title: true, outcome: true, metrics: true },
        },
        vettingLayers: {
          select: { layer: true, score: true, passed: true },
        },
        _count: {
          select: { references: true, certifications: true },
        },
      },
      orderBy: { vettingScore: "desc" },
    });

    // Normalize DB shape to match Candidate interface
    const candidates: Candidate[] = dbCandidates.map((c) => {
      const vettingLayers = {
        resumeAnalysis: { score: 0, passed: false },
        scenarioAssessment: { score: 0, passed: false },
        videoInterview: { score: 0, passed: false },
        referenceCheck: { score: 0, passed: false },
      };
      for (const vl of c.vettingLayers) {
        const key = LAYER_KEY_MAP[vl.layer];
        if (key) vettingLayers[key] = { score: vl.score, passed: vl.passed };
      }

      return {
        id: c.id,
        name: c.name,
        fullName: c.fullName,
        title: c.title,
        avatar: c.avatar,
        vertical: c.vertical as Candidate["vertical"],
        experience: c.experience,
        availability: (availabilityLabels[c.availability] || c.availability) as Candidate["availability"],
        skills: c.skills,
        tools: c.tools,
        location: c.location,
        summary: c.summary,
        vettingScore: c.vettingScore,
        verified: c.verified,
        vettingLayers,
        caseStudies: c.caseStudies,
        certifications: [],
        referenceCount: c._count.references,
        certificationCount: c._count.certifications,
      };
    });

    return { props: { candidates: JSON.parse(JSON.stringify(candidates)) } };
  } catch (error) {
    console.error("Failed to fetch candidates:", error);
    return { props: { candidates: [] } };
  }
};

export default function Dashboard({ candidates: allCandidates }: DashboardProps) {
  const { company, refreshCompany } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [vertical, setVertical] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchScores, setMatchScores] = useState<Record<number, number>>({});
  const [aiMatchedIds, setAiMatchedIds] = useState<number[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("rm_welcome_dismissed")) {
      setShowWelcome(true);
    }
  }, []);

  // Debounced search tracking
  useEffect(() => {
    if (!searchQuery) return;
    const timer = setTimeout(() => trackSearch(searchQuery), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter tracking
  useEffect(() => {
    if (vertical !== "all") trackFilter("vertical", vertical);
  }, [vertical]);
  useEffect(() => {
    if (experienceLevel !== "all") trackFilter("experience", experienceLevel);
  }, [experienceLevel]);

  // AI Matching Algorithm
  const calculateMatchScore = (
    candidate: Candidate,
    jobData: MatchFormData
  ): number => {
    let score = 0;

    const jobDescLower = jobData.jobDescription.toLowerCase();
    const jobTitleLower = jobData.jobTitle.toLowerCase();
    const candidateTitleLower = candidate.title.toLowerCase();
    const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase());

    // 1. Title Match (20 points)
    const titleWords = jobTitleLower.split(" ");
    const titleMatchCount = titleWords.filter((word) =>
      candidateTitleLower.includes(word)
    ).length;
    score += (titleMatchCount / titleWords.length) * 20;

    // 2. Skills Match (35 points)
    const descriptionWords = jobDescLower.split(/\s+/);
    let skillMatches = 0;
    candidateSkillsLower.forEach((skill) => {
      if (
        descriptionWords.some((word) => word.includes(skill) || skill.includes(word))
      ) {
        skillMatches++;
      }
    });
    score += (skillMatches / candidate.skills.length) * 35;

    // 3. Vertical Match (25 points)
    if (jobData.vertical && jobData.vertical !== "all") {
      if (candidate.vertical === jobData.vertical) {
        score += 25;
      }
    } else {
      score += 15; // Partial credit when no vertical specified
    }

    // 4. Experience & Vetting Score (20 points)
    if (candidate.experience >= 8) score += 10;
    else if (candidate.experience >= 5) score += 6;
    if (candidate.vettingScore >= 90) score += 10;
    else if (candidate.vettingScore >= 80) score += 6;

    return Math.min(Math.round(score), 100);
  };

  const handleAIMatch = (data: MatchFormData) => {
    trackAIMatchOpen();
    setIsMatching(true);

    setTimeout(() => {
      const scores: Record<number, number> = {};
      allCandidates.forEach((candidate) => {
        scores[candidate.id] = calculateMatchScore(candidate, data);
      });

      const topMatchIds = Object.entries(scores)
        .filter(([, score]) => score >= 60)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id]) => parseInt(id));

      setMatchScores(scores);
      setAiMatchedIds(topMatchIds);
      trackAIMatchComplete(topMatchIds.length);
      setIsMatching(false);
      setShowAIModal(false);

      setSearchQuery("");
      setExperienceLevel("all");
      setAvailability("all");
      setVertical("all");
      setSelectedSkills([]);
    }, 2500);
  };

  // Filter candidates
  const filteredCandidates = allCandidates.filter((candidate) => {
    const matchesSearch =
      searchQuery === "" ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesExperience =
      experienceLevel === "all" ||
      (experienceLevel === "5-7" && candidate.experience >= 5 && candidate.experience <= 7) ||
      (experienceLevel === "8-10" && candidate.experience >= 8 && candidate.experience <= 10) ||
      (experienceLevel === "10+" && candidate.experience > 10);

    const matchesAvailability =
      availability === "all" || candidate.availability.toLowerCase().includes(availability);

    const matchesVertical =
      vertical === "all" || candidate.vertical === vertical;

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) =>
        candidate.skills.some((candidateSkill) =>
          candidateSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );

    return (
      matchesSearch &&
      matchesExperience &&
      matchesAvailability &&
      matchesVertical &&
      matchesSkills
    );
  });

  // Sort candidates by AI match score if available
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    const scoreA = matchScores[a.id] || 0;
    const scoreB = matchScores[b.id] || 0;
    return scoreB - scoreA;
  });

  return (
    <>
      <SEO
        title="Browse Vetted Talent - ResourceMatch"
        description="Search AI-vetted senior Filipino talent with 5-10+ years experience. Filter by vertical, experience, and skills."
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
        <DashboardHeader />
        <AIBanner onMatchClick={() => setShowAIModal(true)} />

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <StatsCards />

          {showWelcome && company && (company.freeUnlocksUsed ?? 0) < 2 && company.credits > 0 && (
            <div className="mt-6 bg-gradient-to-r from-accent/10 to-light rounded-xl border border-accent/30 p-6 relative">
              <button
                onClick={() => { setShowWelcome(false); localStorage.setItem("rm_welcome_dismissed", "1"); }}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-6 h-6 text-accent" />
                <h3 className="text-lg font-semibold text-slate-900">Welcome to ResourceMatch!</h3>
              </div>
              <p className="text-slate-600">
                You have <strong>{company.credits} free unlock{company.credits !== 1 ? "s" : ""}</strong> to get started.
                Browse our AI-vetted talent below and unlock a profile to see full contact details — no credit card needed.
              </p>
            </div>
          )}

          {company && (
            <MatchingPreferences
              company={company}
              onSave={async (prefs) => {
                await fetch("/api/user/me", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(prefs),
                });
                await refreshCompany();
              }}
            />
          )}

          <div className="mt-8 space-y-6">
            <SearchFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              experienceLevel={experienceLevel}
              setExperienceLevel={setExperienceLevel}
              availability={availability}
              setAvailability={setAvailability}
              vertical={vertical}
              setVertical={setVertical}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
            />

            <CandidateResults
              candidates={sortedCandidates}
              totalCount={sortedCandidates.length}
              matchScores={matchScores}
              aiMatchedIds={aiMatchedIds}
            />
          </div>
        </main>

        <AIMatchModal
          open={showAIModal}
          onClose={() => setShowAIModal(false)}
          onMatch={handleAIMatch}
          isMatching={isMatching}
        />
      </div>
    </>
  );
}
