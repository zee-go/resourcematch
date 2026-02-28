import { useState } from "react";
import type { GetServerSideProps } from "next";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AIBanner } from "@/components/dashboard/AIBanner";
import { AIMatchModal, MatchFormData } from "@/components/dashboard/AIMatchModal";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { CandidateResults } from "@/components/dashboard/CandidateResults";
import type { Candidate } from "@/lib/candidates";

const AVAILABILITY_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
};

const LAYER_KEY_MAP: Record<string, keyof Candidate["vettingLayers"]> = {
  RESUME_ANALYSIS: "resumeAnalysis",
  SCENARIO_ASSESSMENT: "scenarioAssessment",
  VIDEO_INTERVIEW: "videoInterview",
  REFERENCE_CHECK: "referenceCheck",
};

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
        rating: true,
        summary: true,
        vettingScore: true,
        verified: true,
        caseStudies: {
          select: { title: true, outcome: true, metrics: true },
        },
        vettingLayers: {
          select: { layer: true, score: true, passed: true },
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
        availability: (AVAILABILITY_LABELS[c.availability] || c.availability) as Candidate["availability"],
        skills: c.skills,
        tools: c.tools,
        location: c.location,
        rating: c.rating,
        summary: c.summary,
        vettingScore: c.vettingScore,
        verified: c.verified,
        vettingLayers,
        caseStudies: c.caseStudies,
      };
    });

    return { props: { candidates: JSON.parse(JSON.stringify(candidates)) } };
  } catch {
    // Fallback to mock data when DB is not available
    const { candidates } = await import("@/lib/candidates");
    return { props: { candidates } };
  }
};

export default function Dashboard({ candidates: allCandidates }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [vertical, setVertical] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchScores, setMatchScores] = useState<Record<number, number>>({});
  const [aiMatchedIds, setAiMatchedIds] = useState<number[]>([]);

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
        title="Browse Vetted Professionals - ResourceMatch"
        description="Search AI-vetted senior Filipino professionals with 5-10+ years experience. Filter by vertical, experience, and skills."
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
        <DashboardHeader />
        <AIBanner onMatchClick={() => setShowAIModal(true)} />

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <StatsCards />

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
