import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  CreditCard, 
  ClipboardCheck, 
  Video, 
  UserCheck,
  ArrowRight,
  Check
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
    title: "Browse Profiles Free",
    description: "View candidate summaries and skills",
    icon: <Building2 className="w-8 h-8" />,
    detail: "Search and filter 500+ pre-vetted professionals. View skills, experience, and portfolio previews at no cost."
  },
  {
    number: 2,
    title: "Choose Your Plan",
    description: "Free pay-per-unlock or subscription plans",
    icon: <CreditCard className="w-8 h-8" />,
    detail: "Start free at $3/unlock, or choose Starter ($49/mo, 15 unlocks) or Growth ($99/mo, 40 unlocks) for better rates."
  },
  {
    number: 3,
    title: "Unlock & Hire",
    description: "Get contact info and start hiring",
    icon: <Users className="w-8 h-8" />,
    detail: "Unlock profiles to access full contact details, video introductions, and portfolios. Connect directly with candidates."
  }
];

const professionalSteps: Step[] = [
  {
    number: 1,
    title: "Complete Skills Assessment",
    description: "Technical skills test and portfolio review",
    icon: <ClipboardCheck className="w-8 h-8" />,
    detail: "Demonstrate your expertise through our comprehensive skills assessment and portfolio evaluation process."
  },
  {
    number: 2,
    title: "Video Interview",
    description: "Communication skills and background check",
    icon: <Video className="w-8 h-8" />,
    detail: "Showcase your communication abilities and verify your background through our screening interview process."
  },
  {
    number: 3,
    title: "Profile Activation",
    description: "Professional profile creation and introduction video",
    icon: <UserCheck className="w-8 h-8" />,
    detail: "Get featured with a polished professional profile and video introduction. Start receiving premium opportunities."
  }
];

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"companies" | "professionals">("companies");
  const steps = activeTab === "companies" ? companySteps : professionalSteps;
  const primaryColor = activeTab === "companies" ? "forest-green" : "burnet-sienna";

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest-green/5 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-burnet-sienna/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-forest-green/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent processes for both companies and professionals
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
                  ? "bg-forest-green text-white shadow-lg shadow-forest-green/30" 
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
                  ? "bg-burnet-sienna text-white shadow-lg shadow-burnet-sienna/30" 
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <UserCheck className="w-5 h-5" />
              For Professionals
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
                      ? "bg-forest-green text-white" 
                      : "bg-burnet-sienna text-white"
                  }`}>
                    Step {step.number}
                  </div>

                  {/* Icon */}
                  <div className="relative mb-6 inline-block">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      activeTab === "companies"
                        ? "bg-gradient-to-br from-forest-green to-forest-green/80 text-white shadow-lg shadow-forest-green/30"
                        : "bg-gradient-to-br from-burnet-sienna to-burnet-sienna/80 text-white shadow-lg shadow-burnet-sienna/30"
                    }`}>
                      {step.icon}
                    </div>
                    {/* Checkmark Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-background ${
                      activeTab === "companies" ? "bg-forest-green" : "bg-burnet-sienna"
                    }`}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-bold mb-3 transition-colors ${
                    activeTab === "companies" 
                      ? "group-hover:text-forest-green" 
                      : "group-hover:text-burnet-sienna"
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
                    activeTab === "companies" ? "bg-forest-green" : "bg-burnet-sienna"
                  }`} />
                </div>

                {/* Arrow Connector (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-24 -right-2 w-4 h-4 items-center justify-center z-10">
                    <ArrowRight className={`w-6 h-6 ${
                      activeTab === "companies" ? "text-forest-green" : "text-burnet-sienna"
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
              <Button 
                size="lg" 
                className="bg-forest-green hover:bg-forest-green/90 text-white px-8 h-14 text-lg group"
              >
                Browse Profiles Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground">
                No credit card required • Free plan available
              </p>
              <Button variant="outline" size="lg" className="border-2">
                Compare Plans
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="lg" 
                className="bg-burnet-sienna hover:bg-burnet-sienna/90 text-white px-8 h-14 text-lg group"
              >
                Start Application
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Application review takes 3-5 business days
              </p>
              <Button variant="outline" size="lg" className="border-2">
                Learn About Requirements
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}