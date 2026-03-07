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
  vettingScore: number;
  vettingLayers: {
    resumeAnalysis: VettingLayer;
    scenarioAssessment: VettingLayer;
    videoInterview: VettingLayer;
    referenceCheck: VettingLayer;
  };
  referenceCount?: number;
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

