export type Vertical = "ecommerce" | "accounting";

export interface VettingLayer {
  score: number;
  passed: boolean;
}

export interface CaseStudy {
  title: string;
  outcome: string;
  metrics?: string;
}

export interface Reference {
  name: string;
  company: string;
  role: string;
  quote: string;
  verified?: boolean;
}

export interface Certification {
  id?: number;
  title: string;
  issuingBody: string;
  issuedDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface Candidate {
  id: number;
  name: string;
  fullName: string;
  title: string;
  avatar: string;
  vertical: Vertical;
  experience: number;
  availability: "Full-time" | "Part-time" | "Contract";
  skills: string[];
  tools: string[];
  location: string;
  summary: string;
  caseStudies: CaseStudy[];
  certifications: Certification[];
  vettingScore: number;
  vettingLayers: {
    resumeAnalysis: VettingLayer;
    scenarioAssessment: VettingLayer;
    videoInterview: VettingLayer;
    referenceCheck: VettingLayer;
  };
  referenceCount?: number;
  certificationCount?: number;
  verified: boolean;
  verifiedDate?: string;
  // Locked fields (revealed on unlock)
  salaryMin?: number;
  salaryMax?: number;
  email?: string;
  phone?: string;
  linkedIn?: string;
  videoUrl?: string;
  resumeUrl?: string;
  references?: Reference[];
  englishScore?: number;
  discProfile?: string;
}

export const verticalLabels: Record<Vertical, string> = {
  ecommerce: "Operations Management",
  accounting: "Finance & Accounting",
};

export const availabilityLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
};

export const sourceLabels: Record<string, string> = {
  remotive: "Remotive",
  remoteok: "RemoteOK",
};

export const LAYER_KEY_MAP: Record<string, keyof Candidate["vettingLayers"]> = {
  RESUME_ANALYSIS: "resumeAnalysis",
  SCENARIO_ASSESSMENT: "scenarioAssessment",
  VIDEO_INTERVIEW: "videoInterview",
  REFERENCE_CHECK: "referenceCheck",
};

