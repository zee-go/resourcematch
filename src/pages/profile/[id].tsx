import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Star,
  Clock,
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
  MessageSquare,
  Sparkles,
} from "lucide-react";

// Mock candidate data
const mockCandidates: Record<string, any> = {
  "1": {
    id: "1",
    name: "Maria C.",
    fullName: "Maria Christina Santos",
    title: "Senior Full-Stack Developer",
    location: "Manila, Philippines",
    experience: 6,
    hourlyRate: 25,
    matchScore: 95,
    availability: "Available",
    timezone: "GMT+8 (Flexible)",
    summary:
      "Experienced full-stack developer with 6+ years building scalable web applications. Specialized in React, Node.js, and cloud architecture. Previously led development teams at tech startups in Manila and worked with international clients across US, Australia, and Singapore. Passionate about clean code, agile methodologies, and continuous learning.",
    skills: [
      "React",
      "Node.js",
      "TypeScript",
      "PostgreSQL",
      "AWS",
      "Docker",
      "GraphQL",
      "Next.js",
      "MongoDB",
      "Redis",
      "REST APIs",
      "Git",
    ],
    englishScore: 92,
    videoUrl: "/videos/intro-maria.mp4",
    email: "maria.santos@example.com",
    phone: "+63 917 123 4567",
    verified: true,
    governmentId: true,
    references: 3,
    discProfile: "Dominance (D) - Direct, Results-Oriented, Confident",
    commendations: [
      {
        manager: "John Davis",
        company: "TechCorp Inc.",
        text: "Maria consistently delivered high-quality code and mentored junior developers effectively. Her problem-solving skills are exceptional.",
      },
      {
        manager: "Sarah Chen",
        company: "StartupHub",
        text: "One of the best developers I've worked with. Always meets deadlines and communicates proactively with the team.",
      },
    ],
  },
};

export default function CandidateProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [isUnlocked, setIsUnlocked] = useState(false);

  const candidate = mockCandidates[id as string] || mockCandidates["1"];

  const handleUnlock = () => {
    setIsUnlocked(true);
    // In production, this would trigger payment flow
  };

  return (
    <>
      <SEO
        title={`${candidate.name} - ${candidate.title} | ResourceMatch`}
        description={`View ${candidate.name}'s profile. ${candidate.title} with ${candidate.experience}+ years experience. Hourly rate: $${candidate.hourlyRate}/hr.`}
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">RM</span>
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
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                    {candidate.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
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
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">
                        ${candidate.hourlyRate}/hr
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                      {candidate.availability}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      <Clock className="w-3 h-3 mr-1" />
                      Full-Time Available
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      <Globe className="w-3 h-3 mr-1" />
                      Timezone Flexible
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Match Score */}
              <div className="flex flex-col items-end gap-2">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold text-lg">
                    {candidate.matchScore}% Match
                  </span>
                </div>
                <p className="text-xs text-slate-500 text-right">
                  AI-Powered Match Score
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

          {/* Video Introduction - Locked */}
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

          {/* Locked Sections Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Identity Verified */}
            <LockedCard
              icon={<Shield className="w-5 h-5" />}
              title="Identity Verified"
              description="Government ID and background check completed"
            />

            {/* English Proficiency */}
            <LockedCard
              icon={<Award className="w-5 h-5" />}
              title="English Proficiency"
              description={`Score: ${candidate.englishScore}/100 - Advanced Level`}
            />

            {/* Government Documents */}
            <LockedCard
              icon={<FileText className="w-5 h-5" />}
              title="Government ID & TIN"
              description="Verified national ID and tax identification"
            />

            {/* References */}
            <LockedCard
              icon={<Users className="w-5 h-5" />}
              title="Manager References"
              description={`${candidate.references} verified professional references`}
              showProgress
              progress={100}
            />

            {/* Contact Information */}
            <LockedCard
              icon={<Mail className="w-5 h-5" />}
              title="Contact Information"
              description="Email, phone, and resume download"
              highlight
            />

            {/* Personality Assessment */}
            <LockedCard
              icon={<MessageSquare className="w-5 h-5" />}
              title="Personality Assessment"
              description="DISC profile and work style analysis"
            />
          </div>

          {/* Manager Commendations - Locked */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm z-10">
              <Lock className="w-3.5 h-3.5" />
              <span>Locked</span>
            </div>

            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-slate-400" />
              Manager Commendations
            </h2>

            <div className="space-y-4 opacity-50 blur-sm pointer-events-none">
              {candidate.commendations.map((comm: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                >
                  <p className="text-slate-600 italic mb-3">"{comm.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-300" />
                    <div>
                      <p className="font-semibold text-sm text-slate-900">
                        {comm.manager}
                      </p>
                      <p className="text-xs text-slate-500">{comm.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unlock CTA */}
          {!isUnlocked && (
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-2xl">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Unlock Full Profile for $3
                </h3>
                <p className="text-teal-50 mb-6">
                  Get instant access to contact information, video introduction,
                  verified documents, and professional references.
                </p>

                <Button
                  size="lg"
                  onClick={handleUnlock}
                  className="bg-white text-teal-700 hover:bg-teal-50 font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Unlock Profile Now - $3
                </Button>

                <div className="mt-6 space-y-2">
                  <p className="text-sm text-teal-50">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    One-time payment • No subscription required
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
                  You now have full access to {candidate.fullName}'s profile,
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
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// Locked Card Component
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