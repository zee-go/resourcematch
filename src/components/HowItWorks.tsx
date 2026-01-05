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
    title: "Post Your Role",
    description: "Share requirements and budget",
    icon: <Building2 className="w-6 h-6" />,
    detail: "Tell us about your role, required skills, and budget range. Our AI instantly starts matching."
  },
  {
    number: 2,
    title: "AI Matches Candidates",
    description: "Get matched with pre-vetted talent in minutes",
    icon: <Users className="w-6 h-6" />,
    detail: "Receive curated matches based on skills, experience, and availability. No endless scrolling."
  },
  {
    number: 3,
    title: "Pay Per Contact",
    description: "Preview profiles free, unlock for $3 per contact",
    icon: <CreditCard className="w-6 h-6" />,
    detail: "Browse matches for free. Only pay when you want to connect. No subscriptions or hidden fees."
  }
];

const professionalSteps: Step[] = [
  {
    number: 1,
    title: "Complete Skills Assessment",
    description: "Technical skills test and portfolio review",
    icon: <ClipboardCheck className="w-6 h-6" />,
    detail: "Demonstrate your expertise through our comprehensive skills assessment and portfolio evaluation."
  },
  {
    number: 2,
    title: "Video Interview",
    description: "Communication skills and background check",
    icon: <Video className="w-6 h-6" />,
    detail: "Showcase your communication abilities and verify your background through our screening process."
  },
  {
    number: 3,
    title: "Profile Activation",
    description: "Professional profile creation and introduction video",
    icon: <UserCheck className="w-6 h-6" />,
    detail: "Get featured with a polished profile and video intro. Start receiving premium opportunities."
  }
];

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"companies" | "professionals">("companies");
  const steps = activeTab === "companies" ? companySteps : professionalSteps;

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest-green/5 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-burnet-sienna/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-forest-green/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent processes for both companies and professionals
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-16 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab("companies")}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                activeTab === "companies"
                  ? "bg-forest-green text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4 inline-block mr-2" />
              For Companies
            </button>
            <button
              onClick={() => setActiveTab("professionals")}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                activeTab === "professionals"
                  ? "bg-burnet-sienna text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="w-4 h-4 inline-block mr-2" />
              For Professionals
            </button>
          </div>
        </div>

        {/* Steps Content */}
        <div className="relative">
          {/* Desktop Timeline */}
          <div className="hidden md:block absolute top-32 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-muted to-transparent" />
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative animate-fade-in"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                {/* Step Card */}
                <div className="group relative">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      {/* Connecting Line (Mobile) */}
                      {index < steps.length - 1 && (
                        <div className="md:hidden absolute left-1/2 top-full w-0.5 h-8 bg-gradient-to-b from-forest-green/50 to-transparent transform -translate-x-1/2" />
                      )}
                      
                      {/* Step Number Circle */}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                        activeTab === "companies"
                          ? "bg-gradient-to-br from-forest-green to-forest-green/80 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-forest-green/50"
                          : "bg-gradient-to-br from-burnet-sienna to-burnet-sienna/80 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-burnet-sienna/50"
                      }`}>
                        <div className="text-white">
                          {step.icon}
                        </div>
                      </div>

                      {/* Checkmark Badge */}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background transition-all duration-300 ${
                        activeTab === "companies"
                          ? "bg-forest-green"
                          : "bg-burnet-sienna"
                      }`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                      activeTab === "companies"
                        ? "bg-forest-green/10 text-forest-green"
                        : "bg-burnet-sienna/10 text-burnet-sienna"
                    }`}>
                      Step {step.number}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-forest-green transition-colors">
                      {step.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground font-semibold mb-3">
                      {step.description}
                    </p>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.detail}
                    </p>
                  </div>

                  {/* Arrow Indicator (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-32 -right-6 transform -translate-y-1/2">
                      <ArrowRight className={`w-5 h-5 transition-colors ${
                        activeTab === "companies"
                          ? "text-forest-green"
                          : "text-burnet-sienna"
                      }`} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="inline-flex flex-col sm:flex-row gap-4">
            {activeTab === "companies" ? (
              <>
                <Button 
                  size="lg" 
                  className="bg-forest-green hover:bg-forest-green/90 text-white px-8 py-6 text-lg group"
                >
                  Post Your First Role
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-forest-green text-forest-green hover:bg-forest-green/10 px-8 py-6 text-lg"
                >
                  View Sample Profiles
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="bg-burnet-sienna hover:bg-burnet-sienna/90 text-white px-8 py-6 text-lg group"
                >
                  Start Application
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-burnet-sienna text-burnet-sienna hover:bg-burnet-sienna/10 px-8 py-6 text-lg"
                >
                  Learn About Requirements
                </Button>
              </>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            {activeTab === "companies" 
              ? "No credit card required • Preview profiles for free"
              : "Application review takes 3-5 business days"}
          </p>
        </div>
      </div>
    </section>
  );
}