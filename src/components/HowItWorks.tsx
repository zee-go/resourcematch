import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  CreditCard, 
  ClipboardCheck, 
  Video, 
  UserCheck,
  ArrowRight,
  Check,
  ArrowDown
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

        {/* Side-by-Side Columns */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Companies Column */}
          <div className="relative">
            {/* Column Header */}
            <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest-green/10 border-2 border-forest-green/20 mb-4">
                <Building2 className="w-5 h-5 text-forest-green" />
                <span className="font-bold text-forest-green text-lg">For Companies</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Find and hire pre-vetted talent
              </p>
            </div>

            {/* Vertical Timeline */}
            <div className="hidden lg:block absolute left-8 top-48 bottom-32 w-0.5 bg-gradient-to-b from-forest-green via-forest-green/50 to-forest-green/20" />

            {/* Steps */}
            <div className="space-y-8">
              {companySteps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative group animate-fade-in"
                  style={{ animationDelay: `${(index + 2) * 100}ms` }}
                >
                  <div className="flex gap-6">
                    {/* Step Icon */}
                    <div className="flex-shrink-0 relative z-10">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-forest-green to-forest-green/80 flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-forest-green/50">
                        {step.icon}
                      </div>
                      {/* Checkmark Badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-forest-green rounded-full flex items-center justify-center border-2 border-background">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      {/* Connector Arrow */}
                      {index < companySteps.length - 1 && (
                        <div className="hidden lg:flex absolute left-1/2 top-full transform -translate-x-1/2 mt-4 mb-4 h-8 items-center justify-center">
                          <ArrowDown className="w-5 h-5 text-forest-green/50" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-forest-green/10 text-forest-green">
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
                  </div>
                </div>
              ))}
            </div>

            {/* Column CTA */}
            <div className="mt-8 animate-fade-in" style={{ animationDelay: "500ms" }}>
              <Button 
                size="lg" 
                className="w-full bg-forest-green hover:bg-forest-green/90 text-white group"
              >
                Post Your First Role
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                No credit card required • Preview profiles for free
              </p>
            </div>
          </div>

          {/* Professionals Column */}
          <div className="relative">
            {/* Column Header */}
            <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-burnet-sienna/10 border-2 border-burnet-sienna/20 mb-4">
                <UserCheck className="w-5 h-5 text-burnet-sienna" />
                <span className="font-bold text-burnet-sienna text-lg">For Professionals</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Join our exclusive talent network
              </p>
            </div>

            {/* Vertical Timeline */}
            <div className="hidden lg:block absolute left-8 top-48 bottom-32 w-0.5 bg-gradient-to-b from-burnet-sienna via-burnet-sienna/50 to-burnet-sienna/20" />

            {/* Steps */}
            <div className="space-y-8">
              {professionalSteps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative group animate-fade-in"
                  style={{ animationDelay: `${(index + 2) * 100}ms` }}
                >
                  <div className="flex gap-6">
                    {/* Step Icon */}
                    <div className="flex-shrink-0 relative z-10">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-burnet-sienna to-burnet-sienna/80 flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-burnet-sienna/50">
                        {step.icon}
                      </div>
                      {/* Checkmark Badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-burnet-sienna rounded-full flex items-center justify-center border-2 border-background">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      {/* Connector Arrow */}
                      {index < professionalSteps.length - 1 && (
                        <div className="hidden lg:flex absolute left-1/2 top-full transform -translate-x-1/2 mt-4 mb-4 h-8 items-center justify-center">
                          <ArrowDown className="w-5 h-5 text-burnet-sienna/50" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-burnet-sienna/10 text-burnet-sienna">
                        Step {step.number}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 group-hover:text-burnet-sienna transition-colors">
                        {step.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground font-semibold mb-3">
                        {step.description}
                      </p>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Column CTA */}
            <div className="mt-8 animate-fade-in" style={{ animationDelay: "500ms" }}>
              <Button 
                size="lg" 
                className="w-full bg-burnet-sienna hover:bg-burnet-sienna/90 text-white group"
              >
                Start Application
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Application review takes 3-5 business days
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center pt-8 border-t border-border animate-fade-in" style={{ animationDelay: "600ms" }}>
          <p className="text-muted-foreground mb-4">
            Questions about the process?
          </p>
          <Button variant="outline" size="lg" className="border-2">
            View FAQ
          </Button>
        </div>
      </div>
    </section>
  );
}