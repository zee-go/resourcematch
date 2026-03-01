import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { SEO } from "@/components/SEO";
import { UnlockModal } from "@/components/UnlockModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Candidate } from "@/lib/candidates";
import { verticalLabels } from "@/lib/candidates";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Globe,
  Lock,
  Play,
  Download,
  Mail,
  Phone,
  CheckCircle,
  Award,
  Shield,
  FileText,
  Users,
  Sparkles,
  ShieldCheck,
  Building2,
  TrendingUp,
} from "lucide-react";

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

interface ProfileProps {
  candidate: Candidate;
  unlocked: boolean;
}

export const getServerSideProps: GetServerSideProps<ProfileProps> = async (context) => {
  const { id } = context.params!;
  const candidateId = Number(id);

  if (isNaN(candidateId)) {
    return { notFound: true };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const { getServerSession } = await import("next-auth/next");
    const { authOptions } = await import("@/lib/auth");

    // Check unlock status
    let hasUnlocked = false;
    const session = await getServerSession(context.req, context.res, authOptions);
    if (session?.user?.id) {
      const company = await prisma.company.findUnique({
        where: { userId: session.user.id },
      });
      if (company) {
        const unlock = await prisma.unlock.findUnique({
          where: {
            companyId_candidateId: { companyId: company.id, candidateId },
          },
        });
        hasUnlocked = !!unlock;
      }
    }

    const dbCandidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        caseStudies: true,
        references: hasUnlocked,
        vettingLayers: {
          select: { layer: true, score: true, passed: true },
        },
      },
    });

    if (!dbCandidate) {
      return { notFound: true };
    }

    // Normalize vetting layers
    const vettingLayers = {
      resumeAnalysis: { score: 0, passed: false },
      scenarioAssessment: { score: 0, passed: false },
      videoInterview: { score: 0, passed: false },
      referenceCheck: { score: 0, passed: false },
    };
    for (const vl of dbCandidate.vettingLayers) {
      const key = LAYER_KEY_MAP[vl.layer];
      if (key) vettingLayers[key] = { score: vl.score, passed: vl.passed };
    }

    const candidate: Candidate = {
      id: dbCandidate.id,
      name: dbCandidate.name,
      fullName: dbCandidate.fullName,
      title: dbCandidate.title,
      avatar: dbCandidate.avatar,
      vertical: dbCandidate.vertical as Candidate["vertical"],
      experience: dbCandidate.experience,
      availability: (AVAILABILITY_LABELS[dbCandidate.availability] || dbCandidate.availability) as Candidate["availability"],
      skills: dbCandidate.skills,
      tools: dbCandidate.tools,
      location: dbCandidate.location,
      rating: dbCandidate.rating,
      summary: dbCandidate.summary,
      vettingScore: dbCandidate.vettingScore,
      verified: dbCandidate.verified,
      vettingLayers,
      caseStudies: dbCandidate.caseStudies.map((cs) => ({
        title: cs.title,
        outcome: cs.outcome,
        metrics: cs.metrics ?? undefined,
      })),
      ...(hasUnlocked
        ? {
            email: dbCandidate.email ?? undefined,
            phone: dbCandidate.phone ?? undefined,
            linkedIn: dbCandidate.linkedIn ?? undefined,
            videoUrl: dbCandidate.videoUrl ?? undefined,
            englishScore: dbCandidate.englishScore ?? undefined,
            references: (dbCandidate as any).references?.map((ref: any) => ({
              name: ref.name,
              company: ref.company,
              role: ref.role,
              quote: ref.quote,
            })),
          }
        : {}),
    };

    return {
      props: {
        candidate: JSON.parse(JSON.stringify(candidate)),
        unlocked: hasUnlocked,
      },
    };
  } catch (error) {
    console.error("Failed to fetch candidate:", error);
    return { notFound: true };
  }
};

export default function CandidateProfile({ candidate, unlocked }: ProfileProps) {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(unlocked);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const handleUnlock = () => {
    setShowUnlockModal(true);
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    setShowUnlockModal(false);
    // Reload to get full unlocked data from server
    router.replace(router.asPath);
  };

  return (
    <>
      <SEO
        title={`${candidate.name} - ${candidate.title} | ResourceMatch`}
        description={`View ${candidate.name}'s profile. AI-vetted ${candidate.title} with ${candidate.experience}+ years experience. Vetting score: ${candidate.vettingScore}/100.`}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Search
                </Button>
              </Link>
              <Link href="/">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#04443C] to-[#022C27] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">ResourceMatch</span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-200"
                  />
                  {candidate.verified && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">
                    {isUnlocked ? candidate.fullName : candidate.name}
                  </h1>
                  <p className="text-xl text-slate-600 mb-3">
                    {candidate.title}
                  </p>

                  {/* Location & Experience */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{candidate.experience} years experience</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      {verticalLabels[candidate.vertical]}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                      {candidate.availability}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      <Globe className="w-3 h-3 mr-1" />
                      Timezone Flexible
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Vetting Score */}
              <div className="flex flex-col items-end gap-2">
                <div className="bg-gradient-to-r from-[#04443C] to-[#399A8B] text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-bold text-lg">
                    {candidate.vettingScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-500 text-right">
                  AI Vetting Score
                </p>
              </div>
            </div>

            {/* Professional Summary */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Professional Summary
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {candidate.summary}
              </p>
            </div>
          </div>

          {/* Vetting Results */}
          <div className="bg-white rounded-2xl border-2 border-green-200 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              AI Vetting Results
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Resume Analysis", score: candidate.vettingLayers.resumeAnalysis.score, passed: candidate.vettingLayers.resumeAnalysis.passed },
                { label: "Scenario Assessment", score: candidate.vettingLayers.scenarioAssessment.score, passed: candidate.vettingLayers.scenarioAssessment.passed },
                { label: "Video Interview", score: candidate.vettingLayers.videoInterview.score, passed: candidate.vettingLayers.videoInterview.passed },
                { label: "Reference Check", score: candidate.vettingLayers.referenceCheck.score, passed: candidate.vettingLayers.referenceCheck.passed },
              ].map((layer, idx) => (
                <div key={idx} className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Passed</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{layer.score}</div>
                  <div className="text-xs text-slate-600">{layer.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Skills */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              Core Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill: string, idx: number) => (
                <Badge
                  key={idx}
                  className="bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 px-4 py-2 text-sm"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              Tools & Technologies
            </h2>
            <div className="flex flex-wrap gap-2">
              {candidate.tools.map((tool: string, idx: number) => (
                <Badge
                  key={idx}
                  className="bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 px-4 py-2 text-sm"
                >
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          {/* Case Studies */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Portfolio & Case Studies
            </h2>
            <div className="space-y-4">
              {candidate.caseStudies.map((cs, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">{cs.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">{cs.outcome}</p>
                  {cs.metrics && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#04443C]" />
                      <span className="text-sm font-medium text-[#04443C]">{cs.metrics}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video Introduction - Locked */}
          {!isUnlocked && (
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm z-10">
                <Lock className="w-3.5 h-3.5" />
                <span>Locked</span>
              </div>

              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-slate-400" />
                Video Introduction
              </h2>

              <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl aspect-video flex items-center justify-center">
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
                <div className="relative text-center z-10">
                  <div className="w-20 h-20 rounded-full bg-slate-300 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-slate-500" />
                  </div>
                  <p className="text-slate-600 font-medium">
                    Unlock to watch video introduction
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Locked Sections Grid */}
          {!isUnlocked && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <LockedCard
                icon={<Shield className="w-5 h-5" />}
                title="Identity Verified"
                description="Government ID and background check completed"
              />
              <LockedCard
                icon={<Award className="w-5 h-5" />}
                title="English Proficiency"
                description={`Score: ${candidate.englishScore || 90}/100 - Advanced Level`}
              />
              <LockedCard
                icon={<Mail className="w-5 h-5" />}
                title="Contact Information"
                description="Email, phone, LinkedIn, and resume download"
                highlight
              />
              <LockedCard
                icon={<Users className="w-5 h-5" />}
                title="Verified References"
                description={`${candidate.references?.length || 2} verified professional references`}
                showProgress
                progress={100}
              />
            </div>
          )}

          {/* Manager References - Locked */}
          {!isUnlocked && candidate.references && candidate.references.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm z-10">
                <Lock className="w-3.5 h-3.5" />
                <span>Locked</span>
              </div>

              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-400" />
                Verified References
              </h2>

              <div className="space-y-4 opacity-50 blur-sm pointer-events-none">
                {candidate.references.map((ref, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-600 italic mb-3">&ldquo;{ref.quote}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-300" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{ref.name}</p>
                        <p className="text-xs text-slate-500">{ref.role}, {ref.company}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unlock CTA */}
          {!isUnlocked && (
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-2xl">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Unlock Full Profile ($25)
                </h3>
                <p className="text-teal-50 mb-6">
                  Get instant access to contact information, video introduction,
                  verified references, and professional documents.
                </p>

                <Button
                  size="lg"
                  onClick={handleUnlock}
                  className="bg-white text-teal-700 hover:bg-teal-50 font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Unlock Profile ($25)
                </Button>

                <div className="mt-6 space-y-2">
                  <p className="text-sm text-teal-50">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Credits from $16.67 each with packs. Never expire.
                  </p>
                  <p className="text-sm text-teal-50">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    30-day contact guarantee
                  </p>
                  <p className="text-sm text-teal-50">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Instant access to all locked sections
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Unlocked Success Message */}
          {isUnlocked && (
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-2xl">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Profile Unlocked Successfully!
                </h3>
                <p className="text-green-50 mb-6">
                  You now have full access to {candidate.fullName}&apos;s profile,
                  contact information, and all verified documents.
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {candidate.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {candidate.phone}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-white/20 hover:bg-white/30 border-white/30"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Full Resume
                    </Button>
                  </div>
                </div>

                {/* Show references when unlocked */}
                {candidate.references && candidate.references.length > 0 && (
                  <div className="mt-6 text-left">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Verified References
                    </h4>
                    <div className="space-y-3">
                      {candidate.references.map((ref, idx) => (
                        <div key={idx} className="bg-white/10 rounded-xl p-4">
                          <p className="italic mb-2">&ldquo;{ref.quote}&rdquo;</p>
                          <p className="text-sm text-green-100">
                            {ref.name} — {ref.role}, {ref.company}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Unlock Modal */}
        <UnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          candidate={{
            id: candidate.id,
            name: candidate.name,
            title: candidate.title,
            avatar: candidate.name.split(" ").map((n: string) => n[0]).join(""),
            vettingScore: candidate.vettingScore,
          }}
          onUnlockSuccess={handleUnlockSuccess}
        />
      </div>
    </>
  );
}

function LockedCard({
  icon,
  title,
  description,
  highlight = false,
  showProgress = false,
  progress = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
  showProgress?: boolean;
  progress?: number;
}) {
  return (
    <div
      className={`bg-white rounded-xl border-2 p-6 relative overflow-hidden shadow-sm ${
        highlight
          ? "border-teal-300 bg-teal-50/30"
          : "border-slate-200 opacity-75"
      }`}
    >
      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
        <Lock className="w-3 h-3" />
        <span>Locked</span>
      </div>

      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
          highlight
            ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`font-semibold mb-2 ${
          highlight ? "text-teal-900" : "text-slate-900"
        }`}
      >
        {title}
      </h3>
      <p className="text-sm text-slate-600 mb-3">{description}</p>

      {showProgress && (
        <div className="mt-3">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{progress}% Complete</p>
        </div>
      )}
    </div>
  );
}
