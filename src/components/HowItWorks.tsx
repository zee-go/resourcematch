import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ClipboardCheck,
  UserCheck,
  ArrowRight,
  Check,
  ShieldCheck,
  Search,
  Unlock,
} from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  detail: string;
}

const companySteps: Step[] = [
  {
    number: 1,
    title: "Post Jobs for Free",
    description: "Create job listings and let vetted candidates come to you",
    icon: <ClipboardCheck className="w-8 h-8" />,
    detail: "Post unlimited job listings at no cost. AI-vetted senior professionals browse and apply directly to your openings. Review applications, filter by vertical and experience, and shortlist top candidates."
  },
  {
    number: 2,
    title: "Browse & Search Talent",
    description: "Explore portfolio-style profiles of senior professionals",
    icon: <Search className="w-8 h-8" />,
    detail: "Filter by vertical, experience level, and availability. Every candidate has passed our 4-layer AI vetting pipeline. View case studies, vetting scores, and video introductions — all free to browse."
  },
  {
    number: 3,
    title: "Unlock & Connect",
    description: "Only pay when you're ready to reach out",
    icon: <Unlock className="w-8 h-8" />,
    detail: "Use credits to unlock full contact details, verified references, and case studies. Credit packs start at $25/unlock and never expire. Connect directly with your hire — no middleman, no recurring fees required."
  }
];

const professionalSteps: Step[] = [
  {
    number: 1,
    title: "Submit Your Profile",
    description: "Share your resume, portfolio, and career history",
    icon: <ClipboardCheck className="w-8 h-8" />,
    detail: "Share your resume, LinkedIn, and portfolio. Our AI analyzes your career trajectory and identifies your strongest verticals. We look for 5+ years of relevant domain experience."
  },
  {
    number: 2,
    title: "Complete AI Vetting",
    description: "Role-specific assessments and video interview",
    icon: <ShieldCheck className="w-8 h-8" />,
    detail: "Pass scenario-based assessments tailored to your specialty. Record a video introduction showcasing your communication and expertise. Your references are verified automatically."
  },
  {
    number: 3,
    title: "Get Matched",
    description: "Your vetted profile goes live to employers",
    icon: <UserCheck className="w-8 h-8" />,
    detail: "Your AI-vetted profile goes live with a vetting score, case studies, and verification badges. Companies searching your vertical find you first. Premium opportunities for verified senior talent."
  }
];

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"companies" | "professionals">("companies");
  const steps = activeTab === "companies" ? companySteps : professionalSteps;

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent processes for companies and talent
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-16 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="inline-flex rounded-full bg-muted p-1 shadow-lg">
            <button
              onClick={() => setActiveTab("companies")}
              className={`
                px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2
                ${activeTab === "companies"
                  ? "bg-[#04443C] text-white shadow-lg shadow-[#04443C]/30"
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <Building2 className="w-5 h-5" />
              For Companies
            </button>
            <button
              onClick={() => setActiveTab("professionals")}
              className={`
                px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2
                ${activeTab === "professionals"
                  ? "bg-[#D38B53] text-white shadow-lg shadow-[#D38B53]/30"
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <UserCheck className="w-5 h-5" />
              For Talent
            </button>
          </div>
        </div>

        {/* Steps Container */}
        <div className="relative mb-16">
          {/* Progress Line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-4 relative">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative animate-fade-in"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                {/* Step Card */}
                <div className="group relative bg-card rounded-2xl p-8 border-2 border-border hover:border-current transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full">
                  {/* Step Number Badge */}
                  <div className={`absolute -top-4 left-8 px-4 py-1 rounded-full text-xs font-bold ${
                    activeTab === "companies"
                      ? "bg-[#04443C] text-white"
                      : "bg-[#D38B53] text-white"
                  }`}>
                    Step {step.number}
                  </div>

                  {/* Icon */}
                  <div className="relative mb-6 inline-block">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      activeTab === "companies"
                        ? "bg-gradient-to-br from-[#04443C] to-[#04443C]/80 text-white shadow-lg shadow-[#04443C]/30"
                        : "bg-gradient-to-br from-[#D38B53] to-[#D38B53]/80 text-white shadow-lg shadow-[#D38B53]/30"
                    }`}>
                      {step.icon}
                    </div>
                    {/* Checkmark Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-background ${
                      activeTab === "companies" ? "bg-[#04443C]" : "bg-[#D38B53]"
                    }`}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-bold mb-3 transition-colors ${
                    activeTab === "companies"
                      ? "group-hover:text-[#04443C]"
                      : "group-hover:text-[#D38B53]"
                  }`}>
                    {step.title}
                  </h3>

                  <p className="text-sm font-semibold text-muted-foreground mb-4">
                    {step.description}
                  </p>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.detail}
                  </p>

                  {/* Decorative Element */}
                  <div className={`absolute bottom-0 right-0 w-24 h-24 rounded-tl-full opacity-5 ${
                    activeTab === "companies" ? "bg-[#04443C]" : "bg-[#D38B53]"
                  }`} />
                </div>

                {/* Arrow Connector (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-24 -right-2 w-4 h-4 items-center justify-center z-10">
                    <ArrowRight className={`w-6 h-6 ${
                      activeTab === "companies" ? "text-[#04443C]" : "text-[#D38B53]"
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
          {activeTab === "companies" ? (
            <>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-[#04443C] hover:bg-[#022C27] text-white px-8 h-14 text-lg group"
                >
                  Browse Vetted Talent
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                No credit card required to browse profiles
              </p>
            </>
          ) : (
            <>
              <Link href="/apply">
                <Button
                  size="lg"
                  className="bg-[#D38B53] hover:bg-[#B47646] text-white px-8 h-14 text-lg group"
                >
                  Apply as an Expert
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Application review takes 3-5 business days
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
