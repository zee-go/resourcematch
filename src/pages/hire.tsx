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
  Globe
} from "lucide-react";

export default function HirePage() {
  const valueProps = [
    {
      icon: UserCheck,
      title: "Browse Verified Profiles",
      description: "All candidates pre-screened with 3+ years experience",
      features: [
        "Technical skills verified",
        "Video introductions",
        "Portfolio reviewed",
        "Background checked"
      ]
    },
    {
      icon: DollarSign,
      title: "Pay Per Contact Only",
      description: "Preview free, unlock profiles for $3 each",
      features: [
        "No monthly subscriptions",
        "No recruiter fees (20-30%)",
        "No setup costs",
        "Pay only for who you contact"
      ]
    },
    {
      icon: Sparkles,
      title: "Start Hiring Today",
      description: "No subscriptions, contracts, or setup fees",
      features: [
        "AI-powered matching",
        "Instant access to profiles",
        "Direct candidate contact",
        "Hire within 48 hours"
      ]
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
        description="Access 500+ senior Filipino professionals ready for remote work. No job posts, no waiting, no recruiter fees. Pay per contact only."
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
                Access 500+ senior professionals ready for remote work. No job posts. No waiting. No recruiter fees.
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
                    Find Your Next Hire
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Secondary text */}
              <p 
                className="text-sm text-slate-500 animate-fade-in"
                style={{ animationDelay: "400ms" }}
              >
                Trusted by 200+ companies • No credit card required to browse
              </p>
            </div>

            {/* Value Props - 3 Columns */}
            <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {valueProps.map((prop, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${500 + index * 100}ms` }}
                >
                  {/* Icon */}
                  <div className="mb-6 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <prop.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">
                    {prop.title}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {prop.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3">
                    {prop.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-50 to-transparent rounded-bl-full opacity-50" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-12 bg-white border-y border-slate-200">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-sm font-medium text-slate-500 mb-8">
                Trusted by companies from:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {companyLogos.map((location, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
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