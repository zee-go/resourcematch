import { useState } from "react";
import type { GetServerSideProps } from "next";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileSearch,
  ClipboardCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  ResumeAnalysisResult,
  ScenarioQuestion,
} from "@/lib/vetting-types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return { redirect: { destination: "/login?redirect=/admin/vetting", permanent: false } };
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    select: { email: true },
  });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  if (!company || !adminEmails.includes(company.email)) {
    return { notFound: true };
  }

  return { props: {} };
};

type ActiveTab = "resume" | "scenarios";

export default function VettingAdmin() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("resume");

  // Resume Analysis State
  const [resumeText, setResumeText] = useState("");
  const [targetVertical, setTargetVertical] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  // Scenario Assessment State
  const [scenarioVertical, setScenarioVertical] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenarios, setScenarios] = useState<ScenarioQuestion[]>([]);
  const [scenarioError, setScenarioError] = useState("");
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim() || !targetVertical) return;

    setIsAnalyzing(true);
    setAnalysisError("");
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/vetting/resume-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, targetVertical }),
      });

      const data = await response.json();

      if (!data.success) {
        setAnalysisError(data.error || "Analysis failed");
      } else {
        setAnalysisResult(data.data);
      }
    } catch {
      setAnalysisError("Network error. Check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateScenarios = async () => {
    if (!scenarioVertical || !experienceLevel) return;

    setIsGenerating(true);
    setScenarioError("");
    setScenarios([]);

    try {
      const response = await fetch("/api/vetting/scenario-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vertical: scenarioVertical,
          experienceLevel,
          count: 3,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setScenarioError(data.error || "Generation failed");
      } else {
        setScenarios(data.data);
      }
    } catch {
      setScenarioError("Network error. Check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-100";
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-yellow-700 bg-yellow-100";
    if (score >= 60) return "text-orange-700 bg-orange-100";
    return "text-red-700 bg-red-100";
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "expert") return "bg-red-100 text-red-700";
    if (difficulty === "advanced") return "bg-orange-100 text-orange-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <>
      <SEO
        title="Vetting Admin - ResourceMatch"
        description="Internal AI vetting pipeline administration"
      />

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#04443C] to-[#022C27] rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AI Vetting Pipeline</h1>
                <p className="text-sm text-slate-600">Internal administration tool</p>
              </div>
            </div>
            <Badge variant="secondary" className="mt-2">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Internal Use Only
            </Badge>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={activeTab === "resume" ? "default" : "outline"}
              onClick={() => setActiveTab("resume")}
              className={activeTab === "resume" ? "bg-[#04443C] hover:bg-[#022C27]" : ""}
            >
              <FileSearch className="w-4 h-4 mr-2" />
              Resume Analysis
            </Button>
            <Button
              variant={activeTab === "scenarios" ? "default" : "outline"}
              onClick={() => setActiveTab("scenarios")}
              className={activeTab === "scenarios" ? "bg-[#04443C] hover:bg-[#022C27]" : ""}
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Scenario Assessment
            </Button>
          </div>

          {/* Resume Analysis Tab */}
          {activeTab === "resume" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Layer 1: Resume Analysis
                </h2>
                <p className="text-sm text-slate-600">
                  Paste a candidate's resume text and select their target vertical.
                  The AI will analyze career trajectory, experience, vertical fit, and red flags.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Target Vertical
                    </label>
                    <Select value={targetVertical} onValueChange={setTargetVertical}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vertical..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecommerce">E-commerce Operations</SelectItem>
                        <SelectItem value="healthcare">Healthcare Administration</SelectItem>
                        <SelectItem value="accounting">Accounting & Finance</SelectItem>
                        <SelectItem value="marketing">Digital Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Resume Text
                    </label>
                    <Textarea
                      placeholder="Paste the candidate's resume text here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={12}
                      className="resize-none font-mono text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleAnalyzeResume}
                    disabled={isAnalyzing || !resumeText.trim() || !targetVertical}
                    className="bg-[#04443C] hover:bg-[#022C27] text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <FileSearch className="w-4 h-4 mr-2" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Analysis Error */}
              {analysisError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Analysis Failed</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{analysisError}</p>
                </div>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <div className="space-y-4">
                  {/* Score Header */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Analysis Results
                      </h3>
                      <div className="flex items-center gap-3">
                        <Badge className={getScoreColor(analysisResult.score)}>
                          Score: {analysisResult.score}/100
                        </Badge>
                        {analysisResult.passed ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Passed
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3 mr-1" />
                            Below Threshold
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-700 mb-4">{analysisResult.summary}</p>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Experience */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">
                          Experience: {analysisResult.experienceYears} years
                        </h4>
                        <Badge className="mb-2">
                          Trajectory: {analysisResult.careerTrajectory}
                        </Badge>
                      </div>

                      {/* Vertical Fit */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">
                          Vertical Fit: {analysisResult.verticalFit.score}/100
                        </h4>
                        <p className="text-sm text-slate-600">
                          {analysisResult.verticalFit.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Concerns */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Key Strengths
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.keyStrengths.map((strength, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 mt-1 text-green-600 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Concerns & Red Flags
                      </h4>
                      <ul className="space-y-2">
                        {[...analysisResult.concerns, ...analysisResult.redFlags].map(
                          (concern, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 mt-1 text-red-600 flex-shrink-0" />
                              {concern}
                            </li>
                          )
                        )}
                        {analysisResult.concerns.length === 0 &&
                          analysisResult.redFlags.length === 0 && (
                            <li className="text-sm text-slate-500 italic">
                              No significant concerns identified
                            </li>
                          )}
                      </ul>
                    </div>
                  </div>

                  {/* Relevant Experience */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">
                      Relevant Experience
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.relevantExperience.map((exp, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-1 text-[#04443C] flex-shrink-0" />
                          {exp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scenario Assessment Tab */}
          {activeTab === "scenarios" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Layer 2: Scenario Assessment Generator
                </h2>
                <p className="text-sm text-slate-600">
                  Generate role-specific scenario questions for candidate evaluation.
                  Questions test domain expertise, problem-solving, and leadership ability.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Vertical
                    </label>
                    <Select value={scenarioVertical} onValueChange={setScenarioVertical}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vertical..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecommerce">E-commerce Operations</SelectItem>
                        <SelectItem value="healthcare">Healthcare Administration</SelectItem>
                        <SelectItem value="accounting">Accounting & Finance</SelectItem>
                        <SelectItem value="marketing">Digital Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Experience Level
                    </label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5-7 years">5-7 years</SelectItem>
                        <SelectItem value="8-10 years">8-10 years</SelectItem>
                        <SelectItem value="10+ years">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateScenarios}
                  disabled={isGenerating || !scenarioVertical || !experienceLevel}
                  className="bg-[#D38B53] hover:bg-[#B47646] text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Scenarios...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="w-4 h-4 mr-2" />
                      Generate Scenarios
                    </>
                  )}
                </Button>
              </div>

              {/* Scenario Error */}
              {scenarioError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Generation Failed</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{scenarioError}</p>
                </div>
              )}

              {/* Generated Scenarios */}
              {scenarios.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Generated Scenarios ({scenarios.length})
                  </h3>

                  {scenarios.map((scenario, index) => (
                    <div
                      key={scenario.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedScenario(
                            expandedScenario === scenario.id ? null : scenario.id
                          )
                        }
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#04443C] text-white flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getDifficultyColor(scenario.difficulty)}>
                                {scenario.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700 line-clamp-1">
                              {scenario.scenario}
                            </p>
                          </div>
                        </div>
                        {expandedScenario === scenario.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {expandedScenario === scenario.id && (
                        <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">
                            Full Scenario:
                          </h4>
                          <p className="text-sm text-slate-700 mb-4">
                            {scenario.scenario}
                          </p>

                          <h4 className="text-sm font-semibold text-slate-900 mb-2">
                            Evaluation Criteria:
                          </h4>
                          <ul className="space-y-1">
                            {scenario.evaluationCriteria.map((criteria, i) => (
                              <li
                                key={i}
                                className="text-sm text-slate-700 flex items-start gap-2"
                              >
                                <CheckCircle2 className="w-3 h-3 mt-1 text-[#04443C] flex-shrink-0" />
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
