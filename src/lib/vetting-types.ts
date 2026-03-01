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
  candidateId?: number;
  candidateName?: string;
}

export interface ScenarioGenerationRequest {
  vertical: string;
  experienceLevel: string;
  candidateId?: number;
  count?: number;
}

export interface VideoInterviewRequest {
  candidateId: number;
  interviewNotes: string;
  communicationRating: number; // 1-10
  professionalismRating: number; // 1-10
  englishLevel: "basic" | "intermediate" | "advanced" | "native";
  targetVertical: string;
}

export interface ReferenceCheckRequest {
  candidateId: number;
  references: {
    name: string;
    company: string;
    role: string;
    relationship: string;
    feedback: string;
    rating: number; // 1-5
    verified: boolean;
  }[];
  targetVertical: string;
}

export interface ScenarioEvaluationRequest {
  candidateId: number;
  questionId: string;
  scenario: string;
  response: string;
  evaluationCriteria: string[];
  targetVertical: string;
}

export interface ScenarioEvaluationResult extends VettingResult {
  layer: "scenario_evaluation";
  questionId: string;
  strengthsShown: string[];
  areasForImprovement: string[];
  criteriaScores: { criterion: string; score: number; feedback: string }[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
