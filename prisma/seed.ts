import { PrismaClient, Vertical, Availability, VettingStatus, VettingLayer, JobStatus } from "@prisma/client";
import { randomUUID } from "crypto";

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
    title: "Senior Tax Strategist",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    vertical: "accounting",
    experience: 12,
    availability: "Full-time",
    skills: ["Tax Planning", "Tax Compliance", "IRS Representation", "Multi-State Filing", "Entity Structuring", "Audit Support"],
    tools: ["Drake Tax", "Lacerte", "QuickBooks", "TaxJar", "Excel", "Zoom"],
    location: "Makati City, Philippines",
    rating: 4.8,
    summary: "12 years in US tax preparation and strategy with deep expertise in corporate, partnership, and individual returns. Managed tax compliance for 100+ clients annually, specializing in multi-state filing and entity structuring for growth-stage companies.",
    vettingScore: 91,
    verified: true,
    email: "rafael.reyes@example.com",
    phone: "+63 919 345 6789",
    englishScore: 93,
    salaryMin: 3000,
    salaryMax: 4500,
    caseStudies: [
      { title: "Saved $1.2M in taxes through entity restructuring", outcome: "Analyzed and restructured client's business entities to optimize tax position across 5 states", metrics: "$1.2M annual tax savings, compliant with all jurisdictions" },
      { title: "Managed tax compliance for 100+ clients", outcome: "Led a team handling tax preparation and filing for over 100 small business clients", metrics: "Zero missed deadlines over 4 years, 99.8% accuracy rate" },
    ],
    references: [
      { name: "Michael Torres", company: "Pacific Financial Group", role: "Managing Partner", quote: "Rafael's tax knowledge is exceptional. He consistently finds savings our previous CPA firm missed." },
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
    title: "Accounts Receivable Manager",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    vertical: "accounting",
    experience: 9,
    availability: "Part-time",
    skills: ["Accounts Receivable", "Collections Management", "Cash Application", "Credit Analysis", "Aging Reports", "Process Automation"],
    tools: ["QuickBooks Online", "FreshBooks", "Bill.com", "Excel", "Zapier", "Teams"],
    location: "Quezon City, Philippines",
    rating: 4.9,
    summary: "AR specialist with 9 years managing accounts receivable for US-based companies. Expert in collections strategy, cash application, and aging analysis. Reduced DSO by 30%+ for multiple clients.",
    vettingScore: 92,
    verified: true,
    email: "carmen.fernandez@example.com",
    phone: "+63 920 456 7890",
    englishScore: 90,
    salaryMin: 2500,
    salaryMax: 3500,
    caseStudies: [
      { title: "Reduced DSO from 62 to 38 days", outcome: "Implemented automated follow-up sequences and restructured payment terms for a $15M revenue company", metrics: "39% DSO reduction, $800K improvement in cash flow" },
    ],
    references: [
      { name: "Linda Martinez", company: "Summit Financial Services", role: "Operations Manager", quote: "Carmen transformed our AR process. Collections improved dramatically and client relationships stayed strong." },
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
    title: "Shopify Store Manager",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    vertical: "ecommerce",
    experience: 8,
    availability: "Full-time",
    skills: ["Shopify Plus", "Store Optimization", "Product Catalog Management", "Conversion Rate Optimization", "App Integrations", "Theme Customization"],
    tools: ["Shopify Plus", "Klaviyo", "Privy", "Google Analytics", "Figma", "Canva"],
    location: "Pasig City, Philippines",
    rating: 4.7,
    summary: "8 years managing Shopify stores for DTC brands doing $1M-$20M annually. Expert in store optimization, conversion rate improvement, and app ecosystem management. Built and launched 30+ Shopify stores from scratch.",
    vettingScore: 89,
    verified: true,
    email: "sophia.cruz@example.com",
    phone: "+63 923 789 0123",
    englishScore: 96,
    salaryMin: 2500,
    salaryMax: 3500,
    caseStudies: [
      { title: "Increased store conversion rate by 45%", outcome: "Redesigned product pages, checkout flow, and implemented A/B testing program for a $10M DTC brand", metrics: "45% conversion rate lift, $2.1M additional annual revenue" },
      { title: "Launched 15 Shopify stores in 12 months", outcome: "Built and launched Shopify stores for an agency's portfolio of DTC clients", metrics: "15 stores launched, average 3.2% conversion rate" },
    ],
    references: [
      { name: "Mark Johnson", company: "DTC Brands Agency", role: "CEO", quote: "Sophia is the best Shopify expert we've worked with. Her attention to conversion optimization is outstanding." },
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
    title: "E-commerce Operations Analyst",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    vertical: "ecommerce",
    experience: 6,
    availability: "Full-time",
    skills: ["Data Analytics", "Inventory Planning", "Demand Forecasting", "Process Automation", "Reporting", "Operations Strategy"],
    tools: ["Google Analytics 4", "Tableau", "Excel/VBA", "Zapier", "ShipStation", "Looker"],
    location: "Manila, Philippines",
    rating: 4.6,
    summary: "6 years as an operations analyst for e-commerce companies, specializing in data-driven inventory planning, demand forecasting, and process automation. Built dashboards and reporting systems that drive operational decisions.",
    vettingScore: 86,
    verified: true,
    email: "gabriel.lopez@example.com",
    phone: "+63 924 890 1234",
    englishScore: 91,
    salaryMin: 2000,
    salaryMax: 3000,
    caseStudies: [
      { title: "Built automated inventory forecasting system", outcome: "Created demand forecasting model that reduced stockouts by 60% and overstock by 40% for a multi-channel retailer", metrics: "60% fewer stockouts, 40% less overstock, $500K saved annually" },
    ],
    references: [
      { name: "Rachel Green", company: "Evergreen Commerce", role: "VP Operations", quote: "Gabriel's data skills transformed how we manage inventory. His forecasting model paid for itself in the first month." },
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
    title: "Audit & Compliance Manager",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    vertical: "accounting",
    experience: 11,
    availability: "Contract",
    skills: ["Internal Audit", "SOX Compliance", "Risk Assessment", "Internal Controls", "Financial Auditing", "Process Improvement"],
    tools: ["NetSuite", "SAP", "AuditBoard", "Excel VBA", "Power BI", "Teams"],
    location: "Cebu City, Philippines",
    rating: 4.7,
    summary: "11 years in audit and compliance with focus on SOX compliance, internal controls, and risk assessment. Helped 30+ companies strengthen their financial governance and pass external audits.",
    vettingScore: 93,
    verified: true,
    email: "luis.mendoza@example.com",
    phone: "+63 926 012 3456",
    englishScore: 91,
    salaryMin: 3000,
    salaryMax: 4500,
    caseStudies: [
      { title: "SOX compliance program for 15 companies", outcome: "Designed and implemented internal control frameworks that achieved SOX compliance for portfolio of companies", metrics: "100% pass rate on external audits, zero material weaknesses" },
    ],
    references: [
      { name: "Jennifer Adams", company: "Pinnacle Financial Group", role: "VP Finance", quote: "Luis built our entire internal controls framework from scratch. His audit expertise is invaluable." },
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

  // Fix autoincrement sequence after inserting explicit IDs
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('candidates', 'id'), (SELECT MAX(id) FROM candidates))`
  );

  // ─── Seed Demo Companies & Jobs ────────────────────────────
  console.log("\nSeeding demo companies and jobs...");

  // Create demo users for companies (password: "Demo1234!")
  const demoPasswordHash = "$2b$10$demohashdemohashdemohaOdemohashdemohashdemohashdemo"; // placeholder

  const demoCompanies = [
    {
      email: "hiring@techscale.com",
      companyName: "TechScale Ventures",
      companyWebsite: "https://techscale.com",
      companySize: "MEDIUM" as const,
      industry: "Technology",
      verified: true,
      verificationStatus: "VERIFIED" as const,
      verifiedVia: "email_domain",
    },
    {
      email: "talent@pacificretail.com",
      companyName: "Pacific Retail Group",
      companyWebsite: "https://pacificretail.com",
      companySize: "LARGE" as const,
      industry: "Retail / E-commerce",
      verified: true,
      verificationStatus: "VERIFIED" as const,
      verifiedVia: "ai",
    },
    {
      email: "hr@summitfinancial.com",
      companyName: "Summit Financial Services",
      companyWebsite: "https://summitfinancial.com",
      companySize: "SMALL" as const,
      industry: "Financial Services",
      verified: true,
      verificationStatus: "VERIFIED" as const,
      verifiedVia: "ai",
    },
  ];

  const companyIds: string[] = [];

  for (const comp of demoCompanies) {
    const userId = randomUUID();
    const companyId = randomUUID();

    // Skip if company email already exists
    const existing = await prisma.company.findUnique({ where: { email: comp.email } });
    if (existing) {
      companyIds.push(existing.id);
      console.log(`  Skipped existing company: ${comp.companyName}`);
      continue;
    }

    await prisma.user.create({
      data: {
        id: userId,
        email: comp.email,
        passwordHash: demoPasswordHash,
        name: comp.companyName,
        role: "COMPANY",
      },
    });

    await prisma.company.create({
      data: {
        id: companyId,
        userId,
        email: comp.email,
        companyName: comp.companyName,
        companyWebsite: comp.companyWebsite,
        companySize: comp.companySize,
        industry: comp.industry,
        verified: comp.verified,
        verificationStatus: comp.verificationStatus,
        verifiedVia: comp.verifiedVia,
        verifiedAt: new Date(),
        credits: 10,
      },
    });

    companyIds.push(companyId);
    console.log(`  Seeded company: ${comp.companyName}`);
  }

  // Sample jobs across verticals
  const now = new Date();

  interface SeedJob {
    companyIndex: number;
    title: string;
    description: string;
    vertical: Vertical;
    experienceMin: number;
    experienceMax: number | null;
    availability: Availability;
    salaryMin: number | null;
    salaryMax: number | null;
    skills: string[];
    location: string;
    status: JobStatus;
    daysAgo: number; // how many days ago it was published
  }

  const sampleJobs: SeedJob[] = [
    {
      companyIndex: 0,
      title: "Senior Shopify Developer & Store Manager",
      description: "We're looking for an experienced Shopify professional to manage and optimize our portfolio of 5 DTC brands on Shopify Plus. You'll own the entire storefront experience — from theme customization and app integrations to conversion optimization and performance monitoring.\n\nKey responsibilities:\n- Manage day-to-day Shopify Plus store operations across 5 brands\n- Implement A/B tests and conversion optimization experiments\n- Coordinate with design and marketing teams on product launches\n- Monitor site performance, uptime, and checkout flow\n- Manage third-party app ecosystem (Klaviyo, Yotpo, Recharge, etc.)\n\nThis is a full-time remote position with overlap required during US business hours (EST).",
      vertical: "ecommerce",
      experienceMin: 5,
      experienceMax: 10,
      availability: "FULL_TIME",
      salaryMin: 2500,
      salaryMax: 4000,
      skills: ["Shopify Plus", "Liquid", "Conversion Optimization", "A/B Testing", "App Integrations", "Google Analytics"],
      location: "Remote",
      status: "OPEN",
      daysAgo: 3,
    },
    {
      companyIndex: 0,
      title: "E-commerce Operations Analyst",
      description: "Join our operations team to drive data-informed decisions across our e-commerce portfolio. You'll build dashboards, analyze customer behavior, and optimize our supply chain and fulfillment operations.\n\nWhat you'll do:\n- Build and maintain reporting dashboards in Looker/Tableau\n- Analyze sales, inventory, and fulfillment data to identify trends\n- Develop demand forecasting models for inventory planning\n- Partner with ops managers to streamline fulfillment workflows\n- Create weekly performance reports for leadership\n\nIdeal candidate has strong SQL skills and experience with e-commerce platforms.",
      vertical: "ecommerce",
      experienceMin: 5,
      experienceMax: 8,
      availability: "FULL_TIME",
      salaryMin: 2000,
      salaryMax: 3000,
      skills: ["Data Analytics", "SQL", "Tableau", "Inventory Planning", "Demand Forecasting", "Excel/VBA"],
      location: "Remote",
      status: "OPEN",
      daysAgo: 7,
    },
    {
      companyIndex: 1,
      title: "Senior Amazon Marketplace Manager",
      description: "Pacific Retail Group is expanding our Amazon presence across US, CA, and UK marketplaces. We need an experienced Amazon specialist to manage our seller accounts, optimize listings, and scale our advertising.\n\nResponsibilities:\n- Manage Amazon Seller Central accounts across 3 marketplaces\n- Optimize product listings (titles, bullets, A+ content, images)\n- Run and scale Amazon PPC campaigns (Sponsored Products, Brands, Display)\n- Monitor account health, resolve suspensions, and manage compliance\n- Coordinate with supply chain team on FBA inventory planning\n- Track competitor activity and adjust pricing strategy\n\nYou should have deep experience with Amazon's ecosystem and a proven track record of growing marketplace revenue.",
      vertical: "ecommerce",
      experienceMin: 6,
      experienceMax: null,
      availability: "FULL_TIME",
      salaryMin: 2500,
      salaryMax: 3500,
      skills: ["Amazon Seller Central", "Amazon PPC", "Product Listing Optimization", "FBA", "Marketplace Strategy", "Data Analytics"],
      location: "Remote",
      status: "OPEN",
      daysAgo: 2,
    },
    {
      companyIndex: 1,
      title: "Supply Chain & Fulfillment Coordinator",
      description: "We're hiring a supply chain professional to coordinate fulfillment operations across our multi-channel retail business. This role bridges our warehouse teams, 3PL partners, and e-commerce platforms.\n\nKey duties:\n- Coordinate daily fulfillment operations across Shopify, Amazon FBA, and wholesale channels\n- Manage relationships with 3PL partners and negotiate rates\n- Track and resolve shipping issues, returns, and inventory discrepancies\n- Implement process improvements to reduce shipping costs and delivery times\n- Generate weekly logistics reports and KPI tracking\n\nContract position with potential to convert to full-time.",
      vertical: "ecommerce",
      experienceMin: 5,
      experienceMax: 8,
      availability: "CONTRACT",
      salaryMin: 2000,
      salaryMax: 2800,
      skills: ["Supply Chain Management", "3PL Management", "ShipStation", "Inventory Management", "Logistics", "Process Improvement"],
      location: "Remote",
      status: "OPEN",
      daysAgo: 10,
    },
    {
      companyIndex: 2,
      title: "Senior Bookkeeper (US Clients)",
      description: "Summit Financial Services is looking for a senior bookkeeper to manage full-cycle bookkeeping for our portfolio of US-based small business clients. You'll work directly with 10-15 clients, handling everything from bank reconciliations to monthly closes.\n\nWhat we need:\n- Full-cycle bookkeeping for 10-15 small business clients\n- Monthly bank and credit card reconciliations\n- Accounts payable and accounts receivable management\n- Monthly close and financial statement preparation\n- Payroll processing and tax filing support\n- Client communication and onboarding of new accounts\n\nMust be proficient in QuickBooks Online and have experience with US accounting standards.",
      vertical: "accounting",
      experienceMin: 5,
      experienceMax: null,
      availability: "FULL_TIME",
      salaryMin: 2000,
      salaryMax: 3000,
      skills: ["QuickBooks Online", "Bookkeeping", "Bank Reconciliation", "Accounts Payable", "Accounts Receivable", "Payroll"],
      location: "Remote",
      status: "OPEN",
      daysAgo: 5,
    },
    {
      companyIndex: 2,
      title: "Tax Preparation Specialist",
      description: "We need an experienced tax professional to join our team for US individual and small business tax preparation. This is a part-time role with increased hours during tax season (Jan-Apr).\n\nResponsibilities:\n- Prepare individual (1040) and small business (1065, 1120S) tax returns\n- Review client documents and identify deductions/credits\n- Communicate with clients to gather missing information\n- Stay current on tax law changes and updates\n- Support senior tax managers during audit responses\n\nCPA or EA certification preferred. Must have experience with US federal and state tax returns.",
      vertical: "accounting",
      experienceMin: 7,
      experienceMax: 12,
      availability: "PART_TIME",
      salaryMin: 2500,
      salaryMax: 3500,
      skills: ["Tax Preparation", "1040", "1065", "1120S", "Tax Planning", "IRS Compliance"],
      location: "Remote",
      status: "OPEN",
      daysAgo: 1,
    },
    {
      companyIndex: 2,
      title: "Financial Controller",
      description: "Summit Financial Services is hiring a financial controller to oversee financial operations for two of our mid-market clients ($10M-$30M revenue). You'll manage month-end close, financial reporting, and budget vs. actuals analysis.\n\nKey responsibilities:\n- Own the month-end close process (target: 5 business days)\n- Prepare monthly financial statements and variance analysis\n- Manage budget creation and quarterly forecasting\n- Coordinate with external auditors during annual audit\n- Implement and maintain internal controls\n- Mentor and review work of junior bookkeeping staff\n\nStrong financial modeling skills and experience with NetSuite or QuickBooks Enterprise required.",
      vertical: "accounting",
      experienceMin: 8,
      experienceMax: null,
      availability: "FULL_TIME",
      salaryMin: 3000,
      salaryMax: 4500,
      skills: ["Financial Modeling", "Month-End Close", "Financial Reporting", "Budgeting", "Internal Controls", "NetSuite"],
      location: "Remote",
      status: "OPEN",
      daysAgo: 14,
    },
    {
      companyIndex: 0,
      title: "Email Marketing & Retention Specialist",
      description: "We're looking for a lifecycle marketing specialist to own our email and SMS programs across multiple DTC brands. You'll drive customer retention and repeat purchases through automated flows and targeted campaigns.\n\nWhat you'll do:\n- Design and execute email/SMS marketing campaigns in Klaviyo\n- Build and optimize automated flows (welcome, abandoned cart, post-purchase, win-back)\n- Segment audiences and personalize messaging based on behavior\n- Run A/B tests on subject lines, content, and send times\n- Report on campaign performance and customer lifetime value metrics\n- Collaborate with creative team on email design and copy\n\nMust have hands-on Klaviyo experience and a portfolio of past campaigns.",
      vertical: "ecommerce",
      experienceMin: 5,
      experienceMax: 8,
      availability: "FULL_TIME",
      salaryMin: 2000,
      salaryMax: 3000,
      skills: ["Klaviyo", "Email Marketing", "SMS Marketing", "Marketing Automation", "A/B Testing", "Customer Retention"],
      location: "Remote",
      status: "OPEN",
      daysAgo: 6,
    },
  ];

  for (const job of sampleJobs) {
    const publishedAt = new Date(now.getTime() - job.daysAgo * 24 * 60 * 60 * 1000);
    const expiresAt = new Date(publishedAt.getTime() + 90 * 24 * 60 * 60 * 1000);

    await prisma.job.create({
      data: {
        companyId: companyIds[job.companyIndex],
        title: job.title,
        description: job.description,
        vertical: job.vertical,
        experienceMin: job.experienceMin,
        experienceMax: job.experienceMax,
        availability: job.availability,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        skills: job.skills,
        location: job.location,
        status: job.status,
        publishedAt,
        expiresAt,
      },
    });

    console.log(`  Seeded job: ${job.title}`);
  }

  console.log(`\nSeeded ${demoCompanies.length} companies and ${sampleJobs.length} jobs.`);
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
