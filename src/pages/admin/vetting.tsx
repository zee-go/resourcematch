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
import { Input } from "@/components/ui/input";
import {
  FileSearch,
  ClipboardCheck,
  Video,
  UserCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  ResumeAnalysisResult,
  ScenarioQuestion,
  VideoInterviewResult,
  ReferenceCheckResult,
} from "@/lib/vetting-types";
import { requireAdmin } from "@/server/utils/admin-ssr";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return requireAdmin(ctx);
};

type ActiveTab = "resume" | "scenarios" | "video" | "references";

interface ReferenceEntry {
  name: string;
  company: string;
  role: string;
  relationship: string;
  feedback: string;
  rating: number;
  verified: boolean;
}

const emptyReference = (): ReferenceEntry => ({
  name: "",
  company: "",
  role: "",
  relationship: "",
  feedback: "",
  rating: 4,
  verified: true,
});

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

  // Video Interview State
  const [videoCandidateId, setVideoCandidateId] = useState("");
  const [videoVertical, setVideoVertical] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [communicationRating, setCommunicationRating] = useState("7");
  const [professionalismRating, setProfessionalismRating] = useState("7");
  const [englishLevel, setEnglishLevel] = useState<"basic" | "intermediate" | "advanced" | "native">("advanced");
  const [isEvaluatingVideo, setIsEvaluatingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoInterviewResult | null>(null);
  const [videoError, setVideoError] = useState("");

  // Reference Check State
  const [refCandidateId, setRefCandidateId] = useState("");
  const [refVertical, setRefVertical] = useState("");
  const [references, setReferences] = useState<ReferenceEntry[]>([emptyReference()]);
  const [isCheckingRefs, setIsCheckingRefs] = useState(false);
  const [refResult, setRefResult] = useState<ReferenceCheckResult | null>(null);
  const [refError, setRefError] = useState("");

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

  const handleEvaluateVideo = async () => {
    if (!interviewNotes.trim() || !videoVertical || !videoCandidateId) return;

    setIsEvaluatingVideo(true);
    setVideoError("");
    setVideoResult(null);

    try {
      const response = await fetch("/api/vetting/video-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: parseInt(videoCandidateId),
          interviewNotes,
          communicationRating: parseInt(communicationRating),
          professionalismRating: parseInt(professionalismRating),
          englishLevel,
          targetVertical: videoVertical,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setVideoError(data.error || "Evaluation failed");
      } else {
        setVideoResult(data.data);
      }
    } catch {
      setVideoError("Network error. Check your connection and try again.");
    } finally {
      setIsEvaluatingVideo(false);
    }
  };

  const handleCheckReferences = async () => {
    if (!references.length || !refVertical || !refCandidateId) return;

    setIsCheckingRefs(true);
    setRefError("");
    setRefResult(null);

    try {
      const response = await fetch("/api/vetting/reference-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: parseInt(refCandidateId),
          references,
          targetVertical: refVertical,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setRefError(data.error || "Reference check failed");
      } else {
        setRefResult(data.data);
      }
    } catch {
      setRefError("Network error. Check your connection and try again.");
    } finally {
      setIsCheckingRefs(false);
    }
  };

  const updateReference = (index: number, field: keyof ReferenceEntry, value: string | number | boolean) => {
    setReferences((prev) =>
      prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref))
    );
  };

  const addReference = () => {
    setReferences((prev) => [...prev, emptyReference()]);
  };

  const removeReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-100";
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-yellow-700 bg-yellow-100";
    if (score >= 60) return "text-accent bg-accent/10";
    return "text-red-700 bg-red-100";
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "expert") return "bg-red-100 text-red-700";
    if (difficulty === "advanced") return "bg-accent/10 text-accent";
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
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
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
              className={activeTab === "resume" ? "bg-primary hover:bg-primary-dark" : ""}
            >
              <FileSearch className="w-4 h-4 mr-2" />
              Resume Analysis
            </Button>
            <Button
              variant={activeTab === "scenarios" ? "default" : "outline"}
              onClick={() => setActiveTab("scenarios")}
              className={activeTab === "scenarios" ? "bg-primary hover:bg-primary-dark" : ""}
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Scenario Assessment
            </Button>
            <Button
              variant={activeTab === "video" ? "default" : "outline"}
              onClick={() => setActiveTab("video")}
              className={activeTab === "video" ? "bg-primary hover:bg-primary-dark" : ""}
            >
              <Video className="w-4 h-4 mr-2" />
              Video Interview
            </Button>
            <Button
              variant={activeTab === "references" ? "default" : "outline"}
              onClick={() => setActiveTab("references")}
              className={activeTab === "references" ? "bg-primary hover:bg-primary-dark" : ""}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Reference Check
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
                        <SelectItem value="ecommerce">Operations Management</SelectItem>
                        <SelectItem value="accounting">Finance & Accounting</SelectItem>
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
                    className="bg-primary hover:bg-primary-dark text-white"
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
                          <ArrowRight className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
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
                        <SelectItem value="ecommerce">Operations Management</SelectItem>
                        <SelectItem value="accounting">Finance & Accounting</SelectItem>
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
                  className="bg-accent hover:bg-accent/90 text-white"
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
                          <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
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
                                <CheckCircle2 className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
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
          {/* Video Interview Tab */}
          {activeTab === "video" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Layer 3: Video Interview Evaluation
                </h2>
                <p className="text-sm text-slate-600">
                  Enter interview notes and ratings from a candidate&apos;s video interview.
                  The AI will evaluate communication, professionalism, and English proficiency.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Candidate ID
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 1"
                      value={videoCandidateId}
                      onChange={(e) => setVideoCandidateId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Target Vertical
                    </label>
                    <Select value={videoVertical} onValueChange={setVideoVertical}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vertical..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecommerce">Operations Management</SelectItem>
                        <SelectItem value="accounting">Finance & Accounting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Communication Rating (1-10)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={communicationRating}
                      onChange={(e) => setCommunicationRating(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Professionalism Rating (1-10)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={professionalismRating}
                      onChange={(e) => setProfessionalismRating(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      English Level
                    </label>
                    <Select value={englishLevel} onValueChange={(v: "basic" | "intermediate" | "advanced" | "native") => setEnglishLevel(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="native">Native</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Interview Notes
                  </label>
                  <Textarea
                    placeholder="Detailed notes from the video interview — communication style, domain knowledge, professionalism, specific examples..."
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleEvaluateVideo}
                  disabled={isEvaluatingVideo || !interviewNotes.trim() || !videoVertical || !videoCandidateId}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  {isEvaluatingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Evaluating Interview...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Evaluate Interview
                    </>
                  )}
                </Button>
              </div>

              {videoError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Evaluation Failed</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{videoError}</p>
                </div>
              )}

              {videoResult && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Interview Results
                      </h3>
                      <div className="flex items-center gap-3">
                        <Badge className={getScoreColor(videoResult.score)}>
                          Score: {videoResult.score}/100
                        </Badge>
                        {videoResult.passed ? (
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

                    <p className="text-slate-700 mb-4">{videoResult.summary}</p>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">Communication</p>
                        <p className="text-xl font-bold text-slate-900">{videoResult.communicationScore}/100</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">Professionalism</p>
                        <p className="text-xl font-bold text-slate-900">{videoResult.professionalismScore}/100</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">English Proficiency</p>
                        <p className="text-xl font-bold text-slate-900 capitalize">{videoResult.englishProficiency}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">
                      Interview Notes
                    </h4>
                    <ul className="space-y-2">
                      {videoResult.notes.map((note, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reference Check Tab */}
          {activeTab === "references" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Layer 4: Reference Verification
                </h2>
                <p className="text-sm text-slate-600">
                  Enter reference feedback for a candidate. The AI will analyze patterns,
                  consistency, and flag any concerns.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Candidate ID
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 1"
                      value={refCandidateId}
                      onChange={(e) => setRefCandidateId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Target Vertical
                    </label>
                    <Select value={refVertical} onValueChange={setRefVertical}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vertical..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecommerce">Operations Management</SelectItem>
                        <SelectItem value="accounting">Finance & Accounting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Reference entries */}
                {references.map((ref, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900">
                        Reference {index + 1}
                      </h4>
                      {references.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReference(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Name</label>
                        <Input
                          placeholder="John Smith"
                          value={ref.name}
                          onChange={(e) => updateReference(index, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Company</label>
                        <Input
                          placeholder="Acme Corp"
                          value={ref.company}
                          onChange={(e) => updateReference(index, "company", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Role</label>
                        <Input
                          placeholder="VP of Operations"
                          value={ref.role}
                          onChange={(e) => updateReference(index, "role", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Relationship</label>
                        <Input
                          placeholder="Direct manager for 3 years"
                          value={ref.relationship}
                          onChange={(e) => updateReference(index, "relationship", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Rating (1-5)</label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={ref.rating}
                          onChange={(e) => updateReference(index, "rating", parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={ref.verified}
                            onChange={(e) => updateReference(index, "verified", e.target.checked)}
                            className="rounded border-slate-300"
                          />
                          Verified reference
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Feedback</label>
                      <Textarea
                        placeholder="Detailed feedback from reference..."
                        value={ref.feedback}
                        onChange={(e) => updateReference(index, "feedback", e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addReference} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reference
                </Button>

                <Button
                  onClick={handleCheckReferences}
                  disabled={isCheckingRefs || !references[0]?.feedback?.trim() || !refVertical || !refCandidateId}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  {isCheckingRefs ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking References...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Analyze References
                    </>
                  )}
                </Button>
              </div>

              {refError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Reference Check Failed</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{refError}</p>
                </div>
              )}

              {refResult && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Reference Check Results
                      </h3>
                      <div className="flex items-center gap-3">
                        <Badge className={getScoreColor(refResult.score)}>
                          Score: {refResult.score}/100
                        </Badge>
                        {refResult.passed ? (
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

                    <p className="text-slate-700 mb-4">{refResult.summary}</p>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">References Verified</p>
                        <p className="text-xl font-bold text-slate-900">
                          {refResult.referencesVerified}/{refResult.referencesAttempted}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">Average Rating</p>
                        <p className="text-xl font-bold text-slate-900">{refResult.averageRating}/5</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">Overall Score</p>
                        <p className="text-xl font-bold text-slate-900">{refResult.score}/100</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">
                      Highlights & Findings
                    </h4>
                    <ul className="space-y-2">
                      {refResult.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
