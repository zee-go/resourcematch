import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Building2,
  DollarSign,
  UserCheck,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Users,
  Shield,
  Star,
  ArrowRight,
  Zap
} from "lucide-react";

export default function HirePage() {
  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      period: "forever",
      description: "Pay as you go",
      icon: UserCheck,
      color: "slate",
      features: [
        "Browse all candidate profiles",
        "$3 per contact unlock",
        "View skills & experience summaries",
        "Save jobs and browse board",
        "Limited profile previews"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Best for small teams",
      icon: Building2,
      color: "teal",
      features: [
        "15 profile unlocks included",
        "$2 per additional unlock",
        "Full profile access (no contact)",
        "Early access to new candidates (48hrs)",
        "Save & favorite candidates",
        "Monthly usage stats"
      ],
      cta: "Start Starter Plan",
      popular: true
    },
    {
      name: "Growth",
      price: "$99",
      period: "/month",
      description: "For active hiring",
      icon: TrendingUp,
      color: "orange",
      features: [
        "40 profile unlocks included",
        "$1.50 per additional unlock",
        "All Starter features included",
        "Priority email support",
        "Custom search filters",
        "Exclusive high-demand access",
        "Advanced candidate bookmarks"
      ],
      cta: "Start Growth Plan",
      popular: false
    }
  ];

  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Vetted Professionals"
    },
    {
      icon: DollarSign,
      value: "$8-30",
      label: "Average Hourly Rate"
    },
    {
      icon: TrendingUp,
      value: "3+",
      label: "Years Experience Minimum"
    },
    {
      icon: Star,
      value: "95%",
      label: "Client Satisfaction"
    }
  ];

  const companyLogos = [
    { name: "United States", flag: "🇺🇸" },
    { name: "Australia", flag: "🇦🇺" },
    { name: "United Kingdom", flag: "🇬🇧" },
    { name: "Singapore", flag: "🇸🇬" }
  ];

  return (
    <>
      <SEO
        title="Hire Pre-Vetted Filipino Talent - ResourceMatch"
        description="Access 500+ senior Filipino professionals. Browse free, unlock from $1.50-$3. Plans from $49/month."
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Building2 className="h-8 w-8 text-teal-700" />
                <span className="text-2xl font-bold text-slate-900">ResourceMatch</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    <Users className="mr-2 h-4 w-4" />
                    Browse Candidates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full text-teal-700 font-medium animate-fade-in"
                style={{ animationDelay: "0ms" }}
              >
                <Shield className="h-4 w-4" />
                Top 5% Filipino Talent Network
              </div>

              {/* Main Headline */}
              <h1 
                className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                Hire Pre-Vetted Filipino Talent{" "}
                <span className="bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                  in Minutes
                </span>
              </h1>

              {/* Subheading */}
              <p 
                className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                Access 500+ senior professionals ready for remote work. Browse free, unlock from $1.50-$3 per contact.
              </p>

              {/* CTA */}
              <div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
                style={{ animationDelay: "300ms" }}
              >
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-700/30 hover:shadow-xl hover:shadow-teal-700/40 transition-all"
                  >
                    Browse Free Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Secondary text */}
              <p 
                className="text-sm text-slate-500 animate-fade-in"
                style={{ animationDelay: "400ms" }}
              >
                Trusted by 200+ companies • No credit card required
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  Choose Your Plan
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Start free or save up to 50% with a subscription plan
                </p>
              </div>

              {/* Plans Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className={`relative rounded-2xl p-8 border-2 transition-all hover:shadow-xl ${
                      plan.popular
                        ? "border-teal-500 shadow-lg shadow-teal-500/20 scale-105"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-teal-600 text-white px-4 py-1 text-sm font-bold">
                          <Zap className="w-3 h-3 mr-1" />
                          MOST POPULAR
                        </Badge>
                      </div>
                    )}

                    {/* Icon */}
                    <div className="mb-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        plan.color === "teal" ? "bg-teal-100" :
                        plan.color === "orange" ? "bg-orange-100" :
                        "bg-slate-100"
                      }`}>
                        <plan.icon className={`h-7 w-7 ${
                          plan.color === "teal" ? "text-teal-700" :
                          plan.color === "orange" ? "text-orange-600" :
                          "text-slate-600"
                        }`} />
                      </div>
                    </div>

                    {/* Plan Details */}
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-500 ml-2">{plan.period}</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            plan.color === "teal" ? "text-teal-600" :
                            plan.color === "orange" ? "text-orange-600" :
                            "text-slate-500"
                          }`} />
                          <span className="text-sm text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button 
                      className={`w-full h-12 ${
                        plan.popular
                          ? "bg-teal-700 hover:bg-teal-800 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-12 text-center space-y-4">
                <p className="text-sm text-slate-500">
                  💡 Credits expire after 90 days • Top up anytime with manual credit purchases
                </p>
                <p className="text-slate-600 font-medium">
                  Viewing multiple profiles? Save up to 50% with a plan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-12 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-sm font-medium text-slate-500 mb-8">
                Trusted by companies from:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {companyLogos.map((location, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-4xl">{location.flag}</span>
                    <span className="text-sm font-medium text-slate-700">{location.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="py-16 bg-gradient-to-br from-teal-700 to-teal-900 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px"
            }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-3 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-teal-100">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                Ready to Build Your Team?
              </h2>
              <p className="text-xl text-slate-600">
                Start browsing verified profiles in seconds. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-700/30"
                  >
                    Browse All Candidates
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}