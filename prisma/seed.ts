import { PrismaClient, Vertical, Availability, VettingStatus, VettingLayer } from "@prisma/client";

const prisma = new PrismaClient();

// Import mock data structure — we duplicate the data here to avoid
// TypeScript path alias issues in the seed script.
// This data mirrors src/lib/candidates.ts exactly.

const AVAILABILITY_MAP: Record<string, Availability> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contract: "CONTRACT",
};

interface SeedCandidate {
  id: number;
  name: string;
  fullName: string;
  title: string;
  avatar: string;
  vertical: Vertical;
  experience: number;
  availability: string;
  skills: string[];
  tools: string[];
  location: string;
  rating: number;
  summary: string;
  vettingScore: number;
  verified: boolean;
  email?: string;
  phone?: string;
  englishScore?: number;
  salaryMin?: number;
  salaryMax?: number;
  caseStudies: { title: string; outcome: string; metrics?: string }[];
  references?: { name: string; company: string; role: string; quote: string }[];
  vettingLayers: {
    resumeAnalysis: { score: number; passed: boolean };
    scenarioAssessment: { score: number; passed: boolean };
    videoInterview: { score: number; passed: boolean };
    referenceCheck: { score: number; passed: boolean };
  };
}

const candidates: SeedCandidate[] = [
  {
    id: 1,
    name: "Patricia M.",
    fullName: "Patricia Marie Domingo",
    title: "Senior E-commerce Operations Manager",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    vertical: "ecommerce",
    experience: 8,
    availability: "Full-time",
    skills: ["Shopify Plus", "Amazon Seller Central", "Inventory Management", "Supply Chain", "Team Leadership", "Data Analytics"],
    tools: ["Shopify", "Amazon FBA", "Google Analytics", "Klaviyo", "Zapier", "Slack"],
    location: "Manila, Philippines",
    rating: 4.9,
    summary: "8+ years managing e-commerce operations for DTC brands doing $2M-$15M annually. Expert in Shopify Plus, Amazon marketplace, and scaling fulfillment operations across Southeast Asia.",
    vettingScore: 94,
    verified: true,
    email: "patricia.domingo@example.com",
    phone: "+63 917 123 4567",
    englishScore: 95,
    salaryMin: 2500,
    salaryMax: 3500,
    caseStudies: [
      { title: "Scaled DTC brand from $2M to $8M ARR", outcome: "Managed full operations overhaul including fulfillment automation and team scaling from 3 to 12 people", metrics: "300% revenue growth in 18 months" },
      { title: "Amazon marketplace launch", outcome: "Launched brand on Amazon US and achieved Best Seller status in category within 6 months", metrics: "Top 10 in category, 4.6★ average rating" },
    ],
    references: [
      { name: "James O'Brien", company: "ShopDirect Co", role: "CEO", quote: "Patricia transformed our operations. She's the most capable ops manager I've worked with." },
    ],
    vettingLayers: {
      resumeAnalysis: { score: 95, passed: true },
      scenarioAssessment: { score: 92, passed: true },
      videoInterview: { score: 96, passed: true },
      referenceCheck: { score: 93, passed: true },
    },
  },
  {
    id: 2,
    name: "Marco A.",
    fullName: "Marco Antonio Villanueva",
    title: "E-commerce Growth Strategist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    vertical: "ecommerce",
    experience: 6,
    availability: "Full-time",
    skills: ["Shopify", "Facebook Ads", "Google Ads", "Conversion Optimization", "Email Marketing", "A/B Testing"],
    tools: ["Shopify", "Meta Business Suite", "Google Ads", "Klaviyo", "Hotjar", "Figma"],
    location: "Cebu City, Philippines",
    rating: 4.7,
    summary: "6 years driving e-commerce growth through paid media, CRO, and lifecycle marketing. Managed $500K+ monthly ad budgets with consistent 4-6x ROAS.",
    vettingScore: 88,
    verified: true,
    email: "marco.villanueva@example.com",
    phone: "+63 918 234 5678",
    englishScore: 92,
    salaryMin: 2000,
    salaryMax: 3000,
    caseStudies: [
      { title: "Scaled paid media from $50K to $500K/mo", outcome: "Built and managed performance marketing team, maintained 5.2x blended ROAS while scaling 10x", metrics: "5.2x ROAS at $500K/mo spend" },
    ],
    references: [
      { name: "Sarah Kim", company: "BeautyBox Inc", role: "CMO", quote: "Marco is a rare find — strategic thinker who can also execute at a high level." },
    ],
    vettingLayers: {
      resumeAnalysis: { score: 89, passed: true },
      scenarioAssessment: { score: 86, passed: true },
      videoInterview: { score: 90, passed: true },
      referenceCheck: { score: 87, passed: true },
    },
  },
  {
    id: 3,
    name: "Rafael D.",
    fullName: "Rafael Domingo Reyes",
    title: "Healthcare Administration Director",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    vertical: "healthcare",
    experience: 12,
    availability: "Full-time",
    skills: ["Medical Billing", "HIPAA Compliance", "EHR Systems", "Revenue Cycle Management", "Staff Training", "Quality Assurance"],
    tools: ["Epic Systems", "Cerner", "Kareo", "QuickBooks", "Microsoft 365", "Zoom"],
    location: "Makati City, Philippines",
    rating: 4.8,
    summary: "12 years in healthcare administration with deep expertise in US medical billing, HIPAA compliance, and revenue cycle management. Managed teams of 25+ medical coders and billers.",
    vettingScore: 91,
    verified: true,
    email: "rafael.reyes@example.com",
    phone: "+63 919 345 6789",
    englishScore: 93,
    salaryMin: 3000,
    salaryMax: 4500,
    caseStudies: [
      { title: "Reduced claim denials by 40%", outcome: "Implemented new coding review process and staff training program that dramatically improved first-pass claim acceptance", metrics: "40% reduction in denials, $2.1M recovered annually" },
      { title: "HIPAA compliance overhaul", outcome: "Led organization through complete HIPAA compliance audit and remediation, achieving zero violations", metrics: "100% compliance score on audit" },
    ],
    references: [
      { name: "Dr. Michael Torres", company: "Pacific Health Group", role: "Medical Director", quote: "Rafael brought order to our billing chaos. His HIPAA knowledge is exceptional." },
    ],
    vettingLayers: {
      resumeAnalysis: { score: 93, passed: true },
      scenarioAssessment: { score: 89, passed: true },
      videoInterview: { score: 91, passed: true },
      referenceCheck: { score: 92, passed: true },
    },
  },
  {
    id: 4,
    name: "Carmen L.",
    fullName: "Carmen Lucia Fernandez",
    title: "Senior Medical Coding Specialist",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    vertical: "healthcare",
    experience: 9,
    availability: "Part-time",
    skills: ["ICD-10 Coding", "CPT Coding", "Medical Billing", "Claims Processing", "Denial Management", "Compliance Auditing"],
    tools: ["3M Coding System", "Optum360", "Epic", "AdvancedMD", "Excel", "Teams"],
    location: "Quezon City, Philippines",
    rating: 4.9,
    summary: "CPC-certified medical coder with 9 years experience in multi-specialty practices. Expert in ICD-10, CPT, and HCPCS coding with 98%+ accuracy rate.",
    vettingScore: 92,
    verified: true,
    email: "carmen.fernandez@example.com",
    phone: "+63 920 456 7890",
    englishScore: 90,
    salaryMin: 2500,
    salaryMax: 3500,
    caseStudies: [
      { title: "Achieved 98.5% coding accuracy", outcome: "Maintained industry-leading accuracy across 50,000+ annual claims for multi-specialty practice", metrics: "98.5% accuracy, <1% audit error rate" },
    ],
    references: [
      { name: "Linda Martinez", company: "HealthFirst Billing", role: "Operations Manager", quote: "Carmen is the most accurate coder we've ever had. Her attention to detail is remarkable." },
    ],
    vettingLayers: {
      resumeAnalysis: { score: 91, passed: true },
      scenarioAssessment: { score: 94, passed: true },
      videoInterview: { score: 90, passed: true },
      referenceCheck: { score: 93, passed: true },
    },
  },
  {
    id: 5,
    name: "Isabella G.",
    fullName: "Isabella Grace Tan",
    title: "Senior Financial Controller",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    vertical: "accounting",
    experience: 10,
    availability: "Full-time",
    skills: ["Financial Modeling", "QuickBooks", "Xero", "Tax Compliance", "Audit Preparation", "Budget Forecasting"],
    tools: ["QuickBooks Online", "Xero", "Excel/VBA", "Power BI", "Gusto", "Bill.com"],
    location: "Taguig City, Philippines",
    rating: 4.8,
    summary: "CPA with 10 years managing financial operations for US-based SMBs ($1M-$50M revenue). Expert in QuickBooks, Xero, multi-entity consolidation, and tax preparation.",
    vettingScore: 96,
    verified: true,
    email: "isabella.tan@example.com",
    phone: "+63 921 567 8901",
    englishScore: 94,
    salaryMin: 3000,
    salaryMax: 4500,
    caseStudies: [
      { title: "Built financial infrastructure for Series A startup", outcome: "Set up complete accounting system, financial reporting, and forecasting models from scratch", metrics: "Passed Series A due diligence with zero findings" },
      { title: "Multi-entity consolidation", outcome: "Consolidated financials across 4 entities in 3 countries, reducing month-end close from 15 to 5 days", metrics: "67% reduction in close time" },
    ],
    references: [
      { name: "David Chen", company: "TechScale Ventures", role: "CFO", quote: "Isabella's financial modeling skills are on par with Big 4 consultants. Exceptional hire." },
    ],
    vettingLayers: {
      resumeAnalysis: { score: 97, passed: true },
      scenarioAssessment: { score: 95, passed: true },
      videoInterview: { score: 94, passed: true },
      referenceCheck: { score: 96, passed: true },
    },
  },
  {
    id: 6,
    name: "Diego R.",
    fullName: "Diego Ramon Santos",
    title: "Bookkeeper & Tax Specialist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    vertical: "accounting",
    experience: 7,
    availability: "Contract",
    skills: ["Bookkeeping", "Tax Preparation", "Payroll Processing", "Accounts Receivable", "Accounts Payable", "Bank Reconciliation"],
    tools: ["QuickBooks", "FreshBooks", "Gusto", "ADP", "Dext", "HubDoc"],
    location: "Davao City, Philippines",
    rating: 4.6,
    summary: "7 years providing full-cycle bookkeeping and tax preparation services for US small businesses. Manages 20+ client accounts with zero missed deadlines.",
    vettingScore: 85,
    verified: true,
    email: "diego.santos@example.com",
    phone: "+63 922 678 9012",
    englishScore: 88,
    salaryMin: 2000,
    salaryMax: 2800,
    caseStudies: [
      { title: "Managed 25 concurrent client accounts", outcome: "Maintained clean books and timely tax filings across 25 small business clients simultaneously", metrics: "Zero missed deadlines over 3 years" },
    ],
    references: [
      { name: "Amy Wright", company: "Wright & Associates", role: "Managing Partner", quote: "Diego is incredibly reliable. Our clients love working with him." },
    ],
    vettingLayers: {
      resumeAnalysis: { score: 84, passed: true },
      scenarioAssessment: { score: 86, passed: true },
      videoInterview: { score: 85, passed: true },
      referenceCheck: { score: 87, passed: true },
    },
  },
  {
    id: 7,
    name: "Sophia M.",
    fullName: "Sophia Marie Cruz",
    title: "Senior Digital Marketing Manager",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    vertical: "marketing",
    experience: 8,
    availability: "Full-time",
    skills: ["Google Ads", "SEO", "Content Strategy", "Marketing Analytics", "Social Media", "Email Marketing"],
    tools: ["Google Ads", "SEMrush", "Ahrefs", "HubSpot", "Mailchimp", "Canva"],
    location: "Pasig City, Philippines",
    rating: 4.7,
    summary: "8 years leading digital marketing for B2B SaaS and e-commerce brands. Drove $10M+ in attributed pipeline through integrated paid, organic, and content strategies.",
    vettingScore: 89,
    verified: true,
    email: "sophia.cruz@example.com",
    phone: "+63 923 789 0123",
    englishScore: 96,
    salaryMin: 2500,
    salaryMax: 3500,
    caseStudies: [
      { title: "Grew organic traffic 5x in 12 months", outcome: "Led complete SEO overhaul including technical audit, content strategy, and link building program", metrics: "500% organic traffic increase, #1 rankings for 15 target keywords" },
      { title: "$10M attributed pipeline from digital channels", outcome: "Built and optimized full-funnel digital marketing engine for B2B SaaS company", metrics: "$10M pipeline, 35% reduction in CAC" },
    ],
    references: [
      { name: "Mark Johnson", company: "CloudScale SaaS", role: "VP Marketing", quote: "Sophia is a full-stack marketer who delivers results. Her SEO work alone paid for itself 50x over." },
    ],
    vettingLayers: {
      resumeAnalysis: { score: 90, passed: true },
      scenarioAssessment: { score: 88, passed: true },
      videoInterview: { score: 91, passed: true },
      referenceCheck: { score: 87, passed: true },
    },
  },
  {
    id: 8,
    name: "Gabriel A.",
    fullName: "Gabriel Antonio Lopez",
    title: "PPC & Performance Marketing Lead",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    vertical: "marketing",
    experience: 6,
    availability: "Full-time",
    skills: ["Google Ads", "Facebook Ads", "TikTok Ads", "Landing Page Optimization", "Analytics", "Budget Management"],
    tools: ["Google Ads", "Meta Ads Manager", "TikTok Ads", "Google Analytics 4", "Unbounce", "Supermetrics"],
    location: "Manila, Philippines",
    rating: 4.6,
    summary: "6 years managing $1M+ annual ad budgets across Google, Meta, and TikTok. Specialist in e-commerce and lead gen campaigns with consistent 4-8x ROAS.",
    vettingScore: 86,
    verified: true,
    email: "gabriel.lopez@example.com",
    phone: "+63 924 890 1234",
    englishScore: 91,
    salaryMin: 2000,
    salaryMax: 3000,
    caseStudies: [
      { title: "Achieved 7.2x ROAS on $100K/mo budget", outcome: "Managed multi-channel paid media strategy for DTC beauty brand across Google, Meta, and TikTok", metrics: "7.2x ROAS, $8.6M revenue attributed" },
    ],
    references: [
      { name: "Rachel Green", company: "Glow Beauty Co", role: "Founder", quote: "Gabriel doubled our ROAS in 3 months. He's a paid media wizard." },
    ],
    vettingLayers: {
      resumeAnalysis: { score: 85, passed: true },
      scenarioAssessment: { score: 87, passed: true },
      videoInterview: { score: 86, passed: true },
      referenceCheck: { score: 88, passed: true },
    },
  },
  {
    id: 9,
    name: "Andrea C.",
    fullName: "Andrea Christina Reyes",
    title: "Senior Supply Chain Manager",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400",
    vertical: "ecommerce",
    experience: 10,
    availability: "Full-time",
    skills: ["Supply Chain Management", "Procurement", "Logistics", "Vendor Negotiations", "Inventory Planning", "ERP Systems"],
    tools: ["SAP", "NetSuite", "ShipStation", "TradeGecko", "Excel/VBA", "Tableau"],
    location: "Makati City, Philippines",
    rating: 4.8,
    summary: "10 years optimizing supply chains for e-commerce and retail companies. Reduced logistics costs by 30% while improving delivery times across APAC.",
    vettingScore: 90,
    verified: true,
    email: "andrea.reyes@example.com",
    phone: "+63 925 901 2345",
    englishScore: 92,
    salaryMin: 2800,
    salaryMax: 4000,
    caseStudies: [
      { title: "30% logistics cost reduction", outcome: "Renegotiated carrier contracts and optimized routing across 5 APAC markets", metrics: "30% cost reduction, 2-day faster average delivery" },
      { title: "ERP implementation (NetSuite)", outcome: "Led full NetSuite implementation for $20M e-commerce company, integrating inventory, orders, and fulfillment", metrics: "Completed on time and under budget" },
    ],
    references: [
      { name: "Tom Williams", company: "Pacific Retail Group", role: "COO", quote: "Andrea is exceptional at finding inefficiencies and fixing them. She saved us millions." },
    ],
    vettingLayers: {
      resumeAnalysis: { score: 91, passed: true },
      scenarioAssessment: { score: 88, passed: true },
      videoInterview: { score: 92, passed: true },
      referenceCheck: { score: 89, passed: true },
    },
  },
  {
    id: 10,
    name: "Luis E.",
    fullName: "Luis Eduardo Mendoza",
    title: "Healthcare Compliance Officer",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    vertical: "healthcare",
    experience: 11,
    availability: "Contract",
    skills: ["HIPAA Compliance", "Risk Management", "Policy Development", "Staff Training", "Audit Management", "Incident Response"],
    tools: ["Compliancy Group", "SecurityMetrics", "Microsoft 365", "Smartsheet", "PowerPoint", "Teams"],
    location: "Cebu City, Philippines",
    rating: 4.7,
    summary: "11 years in healthcare compliance with focus on HIPAA, risk management, and audit preparation. Helped 30+ healthcare organizations achieve and maintain compliance.",
    vettingScore: 93,
    verified: true,
    email: "luis.mendoza@example.com",
    phone: "+63 926 012 3456",
    englishScore: 91,
    salaryMin: 3000,
    salaryMax: 4500,
    caseStudies: [
      { title: "HIPAA compliance program for 30+ organizations", outcome: "Developed and implemented HIPAA compliance programs across a network of healthcare providers", metrics: "100% pass rate on OCR audits" },
    ],
    references: [
      { name: "Dr. Jennifer Adams", company: "CareFirst Network", role: "Compliance Director", quote: "Luis built our entire compliance infrastructure from scratch. His expertise is invaluable." },
    ],
    vettingLayers: {
      resumeAnalysis: { score: 94, passed: true },
      scenarioAssessment: { score: 91, passed: true },
      videoInterview: { score: 93, passed: true },
      referenceCheck: { score: 95, passed: true },
    },
  },
];

async function main() {
  console.log("Seeding database...");

  for (const c of candidates) {
    const candidate = await prisma.candidate.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        fullName: c.fullName,
        title: c.title,
        avatar: c.avatar,
        vertical: c.vertical as Vertical,
        experience: c.experience,
        availability: AVAILABILITY_MAP[c.availability],
        skills: c.skills,
        tools: c.tools,
        location: c.location,
        rating: c.rating,
        summary: c.summary,
        vettingScore: c.vettingScore,
        verified: c.verified,
        email: c.email,
        phone: c.phone,
        englishScore: c.englishScore,
        salaryMin: c.salaryMin,
        salaryMax: c.salaryMax,
        salaryPeriod: "monthly",
      },
    });

    // Seed case studies
    for (const cs of c.caseStudies) {
      await prisma.caseStudy.create({
        data: {
          candidateId: candidate.id,
          title: cs.title,
          outcome: cs.outcome,
          metrics: cs.metrics,
        },
      });
    }

    // Seed references
    if (c.references) {
      for (const ref of c.references) {
        await prisma.reference.create({
          data: {
            candidateId: candidate.id,
            name: ref.name,
            company: ref.company,
            role: ref.role,
            quote: ref.quote,
          },
        });
      }
    }

    // Seed vetting profile
    await prisma.vettingProfile.create({
      data: {
        candidateId: candidate.id,
        status: VettingStatus.COMPLETED,
        overallScore: c.vettingScore,
        completedAt: new Date(),
      },
    });

    // Seed vetting layer results
    const layers: [VettingLayer, { score: number; passed: boolean }][] = [
      [VettingLayer.RESUME_ANALYSIS, c.vettingLayers.resumeAnalysis],
      [VettingLayer.SCENARIO_ASSESSMENT, c.vettingLayers.scenarioAssessment],
      [VettingLayer.VIDEO_INTERVIEW, c.vettingLayers.videoInterview],
      [VettingLayer.REFERENCE_CHECK, c.vettingLayers.referenceCheck],
    ];

    for (const [layer, result] of layers) {
      await prisma.vettingLayerResult.create({
        data: {
          candidateId: candidate.id,
          layer,
          score: result.score,
          passed: result.passed,
          completedAt: new Date(),
        },
      });
    }

    console.log(`  Seeded candidate: ${c.fullName} (ID: ${c.id})`);
  }

  console.log(`\nSeeded ${candidates.length} candidates with case studies, references, and vetting results.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
