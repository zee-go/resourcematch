// AI Vetting Pipeline Type Definitions

export type VettingStatus = "pending" | "in_progress" | "completed" | "failed";

export interface VettingResult {
  score: number; // 0-100
  passed: boolean;
  summary: string;
  details: string[];
  completedAt?: string;
}

// Layer 1: Resume Analysis
export interface ResumeAnalysisInput {
  resumeText: string;
  targetVertical: string;
}

export interface ResumeAnalysisResult extends VettingResult {
  layer: "resume_analysis";
  experienceYears: number;
  relevantExperience: string[];
  redFlags: string[];
  verticalFit: {
    score: number;
    reasoning: string;
  };
  careerTrajectory: "ascending" | "lateral" | "declining" | "mixed";
  keyStrengths: string[];
  concerns: string[];
}

// Layer 2: Scenario Assessment
export interface ScenarioQuestion {
  id: string;
  vertical: string;
  difficulty: "intermediate" | "advanced" | "expert";
  scenario: string;
  evaluationCriteria: string[];
}

export interface ScenarioAssessmentInput {
  vertical: string;
  experienceLevel: string;
  count?: number;
}

export interface ScenarioResponse {
  questionId: string;
  response: string;
  score: number;
  feedback: string;
}

export interface ScenarioAssessmentResult extends VettingResult {
  layer: "scenario_assessment";
  questions: ScenarioQuestion[];
  responses?: ScenarioResponse[];
}

// Layer 3: Video Interview (metadata only - actual video handled externally)
export interface VideoInterviewResult extends VettingResult {
  layer: "video_interview";
  communicationScore: number;
  professionalismScore: number;
  englishProficiency: "basic" | "intermediate" | "advanced" | "native";
  notes: string[];
}

// Layer 4: Reference Verification
export interface ReferenceCheckResult extends VettingResult {
  layer: "reference_check";
  referencesVerified: number;
  referencesAttempted: number;
  averageRating: number;
  highlights: string[];
}

// Composite Vetting Profile
export interface VettingProfile {
  candidateId: string;
  status: VettingStatus;
  startedAt: string;
  completedAt?: string;
  overallScore: number;
  layers: {
    resumeAnalysis?: ResumeAnalysisResult;
    scenarioAssessment?: ScenarioAssessmentResult;
    videoInterview?: VideoInterviewResult;
    referenceCheck?: ReferenceCheckResult;
  };
}

// API Request/Response types
export interface ResumeAnalysisRequest {
  resumeText: string;
  targetVertical: string;
  candidateName?: string;
}

export interface ScenarioGenerationRequest {
  vertical: string;
  experienceLevel: string;
  count?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
