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
  rating: number;
  summary: string;
  caseStudies: CaseStudy[];
  vettingScore: number;
  vettingLayers: {
    resumeAnalysis: VettingLayer;
    scenarioAssessment: VettingLayer;
    videoInterview: VettingLayer;
    referenceCheck: VettingLayer;
  };
  verified: boolean;
  verifiedDate?: string;
  // Locked fields (revealed on unlock)
  salaryRange?: { min: number; max: number; period: "monthly" };
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

export const candidates: Candidate[] = [
  {
    id: 1,
    name: "Patricia M.",
    fullName: "Patricia Marie Domingo",
    title: "Senior Operations Manager",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    vertical: "ecommerce",
    experience: 10,
    availability: "Full-time",
    skills: ["Shopify", "Amazon Seller Central", "Inventory Management", "PPC Advertising", "Supply Chain", "Team Leadership"],
    tools: ["Helium 10", "Jungle Scout", "Zapier", "Google Analytics", "Klaviyo", "Claude"],
    location: "Manila, Philippines",
    rating: 4.9,
    summary: "Seasoned operations leader with 10+ years scaling DTC brands and Amazon stores. Previously managed $2M+ monthly revenue accounts and led teams of 8-12. Specialized in inventory forecasting, supplier negotiations, and multi-channel fulfillment optimization.",
    caseStudies: [
      {
        title: "Scaled Shopify DTC Brand from $50K to $500K Monthly Revenue",
        outcome: "Built and optimized end-to-end operations for a US-based health supplements brand",
        metrics: "10x revenue growth in 18 months, 35% reduction in fulfillment costs",
      },
      {
        title: "Amazon FBA Launch & Optimization",
        outcome: "Launched 15 SKUs on Amazon US marketplace with full PPC strategy",
        metrics: "Achieved top 10 ranking in 3 categories within 6 months",
      },
    ],
    vettingScore: 94,
    vettingLayers: {
      resumeAnalysis: { score: 96, passed: true },
      scenarioAssessment: { score: 92, passed: true },
      videoInterview: { score: 95, passed: true },
      referenceCheck: { score: 93, passed: true },
    },
    verified: true,
    verifiedDate: "2026-02-15",
    salaryRange: { min: 2500, max: 3500, period: "monthly" },
    email: "patricia.domingo@example.com",
    phone: "+63 917 234 5678",
    videoUrl: "/videos/intro-patricia.mp4",
    englishScore: 95,
    discProfile: "Dominance (D) - Direct, Results-Oriented, Confident",
    references: [
      {
        name: "James Mitchell",
        company: "HealthFirst DTC",
        role: "CEO",
        quote: "Patricia transformed our operations. She doesn't just execute — she anticipates problems and builds systems that prevent them.",
      },
      {
        name: "Sarah Kim",
        company: "Pacific Brands Group",
        role: "COO",
        quote: "One of the most strategic operators I've worked with. She managed our entire Amazon channel independently and scaled it 5x.",
      },
    ],
  },
  {
    id: 2,
    name: "Ricardo S.",
    fullName: "Ricardo Santos Villanueva",
    title: "E-commerce Marketplace Specialist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    vertical: "ecommerce",
    experience: 8,
    availability: "Full-time",
    skills: ["Amazon Seller Central", "Walmart Marketplace", "Product Listing Optimization", "PPC Campaigns", "Inventory Forecasting", "Competitor Analysis"],
    tools: ["Helium 10", "Jungle Scout", "Sellbrite", "InventoryLab", "Google Analytics", "Slack"],
    location: "Cebu, Philippines",
    rating: 4.8,
    summary: "E-commerce marketplace specialist with 8 years managing and scaling Amazon and Walmart seller accounts for US brands. Expert in product listing optimization, PPC campaign management, and inventory forecasting. Managed portfolios generating $5M+ annual revenue.",
    caseStudies: [
      {
        title: "Scaled Amazon Store from $200K to $2M Annual Revenue",
        outcome: "Optimized listings, launched PPC campaigns, and expanded product line for a US supplements brand",
        metrics: "10x revenue growth in 24 months, 28% ACoS average",
      },
      {
        title: "Walmart Marketplace Launch",
        outcome: "Successfully launched 50+ SKUs on Walmart.com with full content and advertising strategy",
        metrics: "$300K revenue in first 6 months, 4.7★ average rating",
      },
    ],
    vettingScore: 91,
    vettingLayers: {
      resumeAnalysis: { score: 93, passed: true },
      scenarioAssessment: { score: 89, passed: true },
      videoInterview: { score: 91, passed: true },
      referenceCheck: { score: 92, passed: true },
    },
    verified: true,
    verifiedDate: "2026-02-10",
    salaryRange: { min: 2000, max: 3000, period: "monthly" },
    email: "ricardo.villanueva@example.com",
    phone: "+63 932 345 6789",
    videoUrl: "/videos/intro-ricardo.mp4",
    englishScore: 92,
    discProfile: "Conscientiousness (C) - Analytical, Detail-Oriented, Systematic",
    references: [
      {
        name: "Jason Park",
        company: "VitalGoods Inc.",
        role: "CEO",
        quote: "Ricardo transformed our Amazon presence. His PPC skills and data-driven approach consistently deliver results.",
      },
    ],
  },
  {
    id: 3,
    name: "Angela D.",
    fullName: "Angela Dela Rosa Cruz",
    title: "Senior Financial Analyst",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    vertical: "accounting",
    experience: 12,
    availability: "Full-time",
    skills: ["Financial Modeling", "Budgeting & Forecasting", "Variance Analysis", "QuickBooks", "Xero", "Advanced Excel"],
    tools: ["QuickBooks Online", "Xero", "Power BI", "Tableau", "Claude", "Google Sheets"],
    location: "Makati, Philippines",
    rating: 4.9,
    summary: "CPA-licensed financial analyst with 12 years in corporate finance and public accounting. Previously at Accenture Manila and two Big 4 firms. Specializes in financial modeling, cash flow forecasting, and management reporting for growth-stage companies.",
    caseStudies: [
      {
        title: "Built Financial Forecasting System for Series B Startup",
        outcome: "Created comprehensive 3-year financial model that supported successful $15M fundraise",
        metrics: "Model accuracy within 5% of actuals over 18 months",
      },
      {
        title: "Month-End Close Process Optimization",
        outcome: "Reduced month-end close from 15 days to 5 days for a 50-person company",
        metrics: "67% reduction in close time, eliminated 20+ hours of manual reconciliation monthly",
      },
    ],
    vettingScore: 96,
    vettingLayers: {
      resumeAnalysis: { score: 98, passed: true },
      scenarioAssessment: { score: 95, passed: true },
      videoInterview: { score: 94, passed: true },
      referenceCheck: { score: 97, passed: true },
    },
    verified: true,
    verifiedDate: "2026-02-20",
    salaryRange: { min: 2500, max: 4000, period: "monthly" },
    email: "angela.cruz@example.com",
    phone: "+63 917 456 7890",
    videoUrl: "/videos/intro-angela.mp4",
    englishScore: 96,
    discProfile: "Conscientiousness (C) - Analytical, Precise, Quality-Focused",
    references: [
      {
        name: "Michael Torres",
        company: "GrowthTech Inc.",
        role: "CFO",
        quote: "Angela's financial models are the backbone of our strategic planning. Her work directly contributed to our Series B raise.",
      },
      {
        name: "Linda Reyes",
        company: "Accenture Philippines",
        role: "Senior Manager",
        quote: "One of the sharpest analysts in our Manila office. Consistently delivered work that exceeded client expectations.",
      },
    ],
  },
  {
    id: 4,
    name: "Marcus T.",
    fullName: "Marcus Tan Espiritu",
    title: "Fulfillment & Logistics Manager",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    vertical: "ecommerce",
    experience: 9,
    availability: "Full-time",
    skills: ["Fulfillment Operations", "3PL Management", "Warehouse Optimization", "Shipping Strategy", "Returns Management", "Team Leadership"],
    tools: ["ShipStation", "ShipBob", "Deliverr", "NetSuite", "Monday.com", "Slack"],
    location: "Quezon City, Philippines",
    rating: 4.8,
    summary: "Fulfillment and logistics leader with 9 years optimizing end-to-end supply chains for DTC and marketplace brands. Managed 3PL relationships, warehouse operations, and international shipping for companies doing $5M-$30M annually. Expert in cost reduction and delivery speed optimization.",
    caseStudies: [
      {
        title: "Reduced Shipping Costs by 35% Across 3 Fulfillment Centers",
        outcome: "Renegotiated carrier contracts, optimized packaging, and implemented zone-skipping strategy",
        metrics: "35% cost reduction, 1.5-day faster average delivery",
      },
      {
        title: "3PL Migration & Warehouse Optimization",
        outcome: "Led migration from in-house fulfillment to 3PL network for a $20M DTC brand",
        metrics: "99.8% order accuracy, 40% reduction in fulfillment labor costs",
      },
    ],
    vettingScore: 89,
    vettingLayers: {
      resumeAnalysis: { score: 91, passed: true },
      scenarioAssessment: { score: 87, passed: true },
      videoInterview: { score: 90, passed: true },
      referenceCheck: { score: 88, passed: true },
    },
    verified: true,
    verifiedDate: "2026-02-18",
    salaryRange: { min: 2500, max: 3500, period: "monthly" },
    email: "marcus.espiritu@example.com",
    phone: "+63 918 567 8901",
    videoUrl: "/videos/intro-marcus.mp4",
    englishScore: 94,
    discProfile: "Influence (I) - Persuasive, Collaborative, Energetic",
    references: [
      {
        name: "David Chen",
        company: "SwiftShip Co.",
        role: "COO",
        quote: "Marcus cut our fulfillment costs by a third while improving delivery speed. His logistics expertise is world-class.",
      },
    ],
  },
  {
    id: 5,
    name: "Isabella G.",
    fullName: "Isabella Garcia Mendoza",
    title: "Senior Operations Manager",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    vertical: "ecommerce",
    experience: 8,
    availability: "Full-time",
    skills: ["Process Optimization", "Vendor Management", "Logistics Coordination", "Team Management", "Shopify Plus", "Data Analysis"],
    tools: ["ShipStation", "Shopify Plus", "Monday.com", "Slack", "Google Workspace", "Zapier"],
    location: "Pasig, Philippines",
    rating: 4.9,
    summary: "Operations leader with 8 years building and scaling e-commerce fulfillment and customer experience operations. Previously managed end-to-end operations for a $10M ARR DTC brand. Known for building SOPs that enable teams to scale without constant oversight.",
    caseStudies: [
      {
        title: "Built Customer Support Team from 0 to 15",
        outcome: "Designed hiring process, training program, and QA framework for a rapidly growing DTC brand",
        metrics: "95% CSAT score, <2 hour first response time, 40% reduction in ticket volume via self-service",
      },
    ],
    vettingScore: 90,
    vettingLayers: {
      resumeAnalysis: { score: 92, passed: true },
      scenarioAssessment: { score: 88, passed: true },
      videoInterview: { score: 91, passed: true },
      referenceCheck: { score: 89, passed: true },
    },
    verified: true,
    verifiedDate: "2026-02-12",
    salaryRange: { min: 2000, max: 3000, period: "monthly" },
    email: "isabella.mendoza@example.com",
    phone: "+63 917 678 9012",
    videoUrl: "/videos/intro-isabella.mp4",
    englishScore: 93,
    discProfile: "Steadiness (S) - Reliable, Patient, Team-Oriented",
    references: [
      {
        name: "Chris Baker",
        company: "ModernLiving Co.",
        role: "Founder & CEO",
        quote: "Isabella built our entire operations from scratch. She hired the team, created the processes, and runs everything autonomously.",
      },
    ],
  },
  {
    id: 6,
    name: "Daniel R.",
    fullName: "Daniel Reyes Santos",
    title: "Payroll & Tax Compliance Specialist",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    vertical: "accounting",
    experience: 7,
    availability: "Full-time",
    skills: ["Payroll Processing", "Tax Compliance", "W-2/1099 Filing", "Multi-State Payroll", "Benefits Administration", "Audit Support"],
    tools: ["Gusto", "ADP", "Paychex", "QuickBooks", "TaxJar", "Google Workspace"],
    location: "Taguig, Philippines",
    rating: 4.7,
    summary: "Payroll and tax compliance specialist with 7 years managing payroll operations for US-based SMBs. Expert in multi-state payroll, W-2/1099 filing, and benefits administration. Manages payroll for 500+ employees across 15+ clients with zero missed deadlines.",
    caseStudies: [
      {
        title: "Streamlined Multi-State Payroll for 200+ Employees",
        outcome: "Consolidated payroll across 8 US states onto a single platform with automated tax calculations",
        metrics: "Zero payroll errors in 18 months, 60% reduction in processing time",
      },
    ],
    vettingScore: 86,
    vettingLayers: {
      resumeAnalysis: { score: 88, passed: true },
      scenarioAssessment: { score: 84, passed: true },
      videoInterview: { score: 87, passed: true },
      referenceCheck: { score: 85, passed: true },
    },
    verified: true,
    verifiedDate: "2026-02-08",
    salaryRange: { min: 1800, max: 2500, period: "monthly" },
    email: "daniel.santos@example.com",
    phone: "+63 932 789 0123",
    videoUrl: "/videos/intro-daniel.mp4",
    englishScore: 90,
    discProfile: "Steadiness (S) - Dependable, Supportive, Consistent",
    references: [
      {
        name: "Amy Wright",
        company: "Wright & Associates",
        role: "Managing Partner",
        quote: "Daniel handles payroll for a dozen of our clients flawlessly. His accuracy and reliability are outstanding.",
      },
    ],
  },
  {
    id: 7,
    name: "Carmen L.",
    fullName: "Carmen Lozano Aquino",
    title: "Senior Bookkeeper & Controller",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
    vertical: "accounting",
    experience: 9,
    availability: "Full-time",
    skills: ["Full-Cycle Bookkeeping", "Accounts Payable/Receivable", "Payroll Processing", "Tax Preparation", "Financial Reporting", "Audit Support"],
    tools: ["QuickBooks Online", "Xero", "Gusto", "Bill.com", "Dext", "Claude"],
    location: "Cebu, Philippines",
    rating: 4.8,
    summary: "Controller-level bookkeeper with 9 years managing finances for US-based SMBs. Handles full-cycle bookkeeping, payroll, tax prep coordination, and financial reporting. Previously managed books for 15+ simultaneous clients at a Philippine-based accounting firm.",
    caseStudies: [
      {
        title: "Cleaned Up 2 Years of Backlogged Books",
        outcome: "Reconciled 24 months of neglected bookkeeping for a $5M revenue e-commerce company",
        metrics: "Completed in 6 weeks, uncovered $180K in uncategorized expenses, prepared clean financials for tax filing",
      },
    ],
    vettingScore: 92,
    vettingLayers: {
      resumeAnalysis: { score: 94, passed: true },
      scenarioAssessment: { score: 90, passed: true },
      videoInterview: { score: 93, passed: true },
      referenceCheck: { score: 91, passed: true },
    },
    verified: true,
    verifiedDate: "2026-02-14",
    salaryRange: { min: 2000, max: 2800, period: "monthly" },
    email: "carmen.aquino@example.com",
    phone: "+63 917 890 1234",
    videoUrl: "/videos/intro-carmen.mp4",
    englishScore: 91,
    discProfile: "Conscientiousness (C) - Meticulous, Reliable, Process-Driven",
    references: [
      {
        name: "Tom Bradley",
        company: "Bradley & Associates CPA",
        role: "Managing Partner",
        quote: "Carmen is the most reliable bookkeeper we've worked with. She catches discrepancies our CPAs miss and always meets deadlines.",
      },
    ],
  },
  {
    id: 8,
    name: "Rafael B.",
    fullName: "Rafael Bautista Reyes",
    title: "Financial Controller & Reporting Lead",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    vertical: "accounting",
    experience: 7,
    availability: "Full-time",
    skills: ["Financial Reporting", "Internal Controls", "Cash Flow Management", "Variance Analysis", "Accounts Reconciliation", "Compliance"],
    tools: ["Xero", "QuickBooks Enterprise", "Power BI", "Excel VBA", "Dext", "Bill.com"],
    location: "Davao, Philippines",
    rating: 4.7,
    summary: "Financial controller with 7 years overseeing financial reporting and internal controls for US-based SMBs. Expert in cash flow management, variance analysis, and building scalable financial processes. Previously at Deloitte Manila before transitioning to remote controller roles.",
    caseStudies: [
      {
        title: "Built Financial Reporting Framework for $10M SaaS Company",
        outcome: "Designed monthly reporting package, KPI dashboards, and board-ready financials from scratch",
        metrics: "Reduced reporting time from 3 weeks to 5 days, enabled data-driven decision making",
      },
    ],
    vettingScore: 85,
    vettingLayers: {
      resumeAnalysis: { score: 87, passed: true },
      scenarioAssessment: { score: 83, passed: true },
      videoInterview: { score: 86, passed: true },
      referenceCheck: { score: 84, passed: true },
    },
    verified: true,
    verifiedDate: "2026-02-16",
    salaryRange: { min: 1800, max: 2500, period: "monthly" },
    email: "rafael.reyes@example.com",
    phone: "+63 918 901 2345",
    videoUrl: "/videos/intro-rafael.mp4",
    englishScore: 93,
    discProfile: "Influence (I) - Creative, Strategic, Communicative",
    references: [
      {
        name: "Kevin Park",
        company: "CloudMetrics SaaS",
        role: "CEO",
        quote: "Rafael brought financial discipline to our company. His reporting framework gave us the visibility we needed to make better decisions.",
      },
    ],
  },
  {
    id: 9,
    name: "Sophia C.",
    fullName: "Sophia Chen Navarro",
    title: "E-commerce Customer Experience Director",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400",
    vertical: "ecommerce",
    experience: 6,
    availability: "Full-time",
    skills: ["Customer Experience Strategy", "CRM Management", "Support Team Leadership", "Process Automation", "Quality Assurance", "Retention Strategy"],
    tools: ["Zendesk", "Gorgias", "Shopify", "Klaviyo", "Zapier", "Claude"],
    location: "Iloilo, Philippines",
    rating: 4.8,
    summary: "Customer experience leader with 6 years building and managing support teams for high-growth e-commerce brands. Specializes in scaling CX operations while maintaining quality, implementing self-service solutions, and turning customer insights into product improvements.",
    caseStudies: [
      {
        title: "Scaled CX Team During 10x Growth Period",
        outcome: "Grew support team from 3 to 20 agents while maintaining 98% CSAT during a product launch surge",
        metrics: "Handled 5,000+ tickets/month, maintained <1 hour first response, built comprehensive knowledge base",
      },
    ],
    vettingScore: 88,
    vettingLayers: {
      resumeAnalysis: { score: 89, passed: true },
      scenarioAssessment: { score: 87, passed: true },
      videoInterview: { score: 90, passed: true },
      referenceCheck: { score: 86, passed: true },
    },
    verified: true,
    verifiedDate: "2026-02-19",
    salaryRange: { min: 1800, max: 2500, period: "monthly" },
    email: "sophia.navarro@example.com",
    phone: "+63 917 012 3456",
    videoUrl: "/videos/intro-sophia.mp4",
    englishScore: 94,
    discProfile: "Influence (I) - Empathetic, People-Focused, Solution-Oriented",
    references: [
      {
        name: "Jake Thompson",
        company: "FreshGoods Co.",
        role: "VP of Operations",
        quote: "Sophia doesn't just manage support — she builds customer experience strategies that directly drive retention and revenue.",
      },
    ],
  },
  {
    id: 10,
    name: "Eduardo M.",
    fullName: "Eduardo Martinez Lim",
    title: "Senior Accounting Manager",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
    vertical: "accounting",
    experience: 11,
    availability: "Part-time",
    skills: ["Management Accounting", "Financial Consolidation", "ERP Implementation", "Internal Controls", "Compliance Reporting", "Team Leadership"],
    tools: ["NetSuite", "SAP", "QuickBooks Enterprise", "Power BI", "Excel VBA", "Claude"],
    location: "Makati, Philippines",
    rating: 4.9,
    summary: "CPA with 11 years in management accounting and financial consolidation. Previously Senior Accountant at JPMorgan Chase Manila shared services center. Expert in multi-entity consolidation, ERP implementation, and building internal control frameworks for growing companies.",
    caseStudies: [
      {
        title: "Led NetSuite ERP Implementation",
        outcome: "Managed full ERP migration from QuickBooks to NetSuite for a $20M revenue company with 3 subsidiaries",
        metrics: "Completed in 4 months, automated 80% of manual journal entries, reduced reporting time by 60%",
      },
    ],
    vettingScore: 93,
    vettingLayers: {
      resumeAnalysis: { score: 96, passed: true },
      scenarioAssessment: { score: 91, passed: true },
      videoInterview: { score: 92, passed: true },
      referenceCheck: { score: 94, passed: true },
    },
    verified: true,
    verifiedDate: "2026-02-22",
    salaryRange: { min: 2500, max: 3500, period: "monthly" },
    email: "eduardo.lim@example.com",
    phone: "+63 918 123 4567",
    videoUrl: "/videos/intro-eduardo.mp4",
    englishScore: 95,
    discProfile: "Conscientiousness (C) - Strategic, Detail-Oriented, Principled",
    references: [
      {
        name: "Jennifer Wu",
        company: "JPMorgan Chase Manila",
        role: "VP, Finance Operations",
        quote: "Eduardo was one of our top performers in the shared services center. His technical skills and leadership potential are outstanding.",
      },
    ],
  },
];
