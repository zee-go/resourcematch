import { useState } from "react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthProvider";
import Link from "next/link";
import {
  Building2,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  Zap,
  MapPin,
  Briefcase,
  Eye,
  Coins,
  CreditCard,
  Crown,
  Loader2,
} from "lucide-react";
import { LogoIcon } from "@/components/LogoIcon";
import { verticalLabels } from "@/lib/candidates";

interface PreviewCandidate {
  id: number;
  name: string;
  title: string;
  avatar: string;
  vertical: string;
  experience: number;
  vettingScore: number;
  verified: boolean;
  skills: string[];
  caseStudyTitle?: string;
  caseStudyMetrics?: string;
}

interface HirePageProps {
  previewCandidates: PreviewCandidate[];
}

export const getServerSideProps: GetServerSideProps<HirePageProps> = async () => {
  try {
    const { prisma } = await import("@/lib/prisma");
    const dbCandidates = await prisma.candidate.findMany({
      take: 6,
      orderBy: { vettingScore: "desc" },
      select: {
        id: true,
        name: true,
        title: true,
        avatar: true,
        vertical: true,
        experience: true,
        vettingScore: true,
        verified: true,
        skills: true,
        caseStudies: {
          take: 1,
          select: { title: true, metrics: true },
        },
      },
    });

    const previewCandidates: PreviewCandidate[] = dbCandidates.map((c) => ({
      id: c.id,
      name: c.name,
      title: c.title,
      avatar: c.avatar,
      vertical: c.vertical,
      experience: c.experience,
      vettingScore: c.vettingScore,
      verified: c.verified,
      skills: c.skills,
      caseStudyTitle: c.caseStudies[0]?.title,
      caseStudyMetrics: c.caseStudies[0]?.metrics ?? undefined,
    }));

    return { props: { previewCandidates: JSON.parse(JSON.stringify(previewCandidates)) } };
  } catch (error) {
    console.error("Failed to fetch preview candidates:", error);
    return { props: { previewCandidates: [] } };
  }
};

export default function HirePage({ previewCandidates }: HirePageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const creditPacks = [
    { id: "pack_1", credits: 1, price: 25, perUnlock: "25.00" },
    { id: "pack_5", credits: 5, price: 100, perUnlock: "20.00", popular: true },
    { id: "pack_15", credits: 15, price: 250, perUnlock: "16.67" },
  ];

  const subscriptionPlans = [
    {
      name: "Starter",
      tier: "STARTER",
      price: "$149",
      period: "/month",
      description: "For selective hiring",
      icon: Building2,
      color: "secondary",
      features: [
        "10 profile unlocks per month",
        "AI-powered candidate matching",
        "Priority support",
        "Save & favorite candidates",
        "Unused unlocks roll over 1 month",
      ],
      cta: "Start Starter Plan",
      popular: true,
    },
    {
      name: "Growth",
      tier: "GROWTH",
      price: "$299",
      period: "/month",
      description: "For active hiring",
      icon: TrendingUp,
      color: "accent",
      features: [
        "25 profile unlocks per month",
        "All Starter features",
        "Custom search filters",
        "Saved searches & alerts",
        "Dedicated matching support",
      ],
      cta: "Start Growth Plan",
      popular: false,
    },
    {
      name: "Enterprise",
      tier: "ENTERPRISE",
      price: "$599",
      period: "/month",
      description: "Unlimited hiring",
      icon: Crown,
      color: "slate",
      features: [
        "Unlimited profile unlocks",
        "All Growth features",
        "API access",
        "Dedicated account manager",
        "Custom vetting criteria",
        "Bulk hiring tools",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const stats = [
    { icon: Users, value: "200+", label: "Vetted Senior Talent" },
    { icon: ShieldCheck, value: "4-Layer", label: "AI Vetting Pipeline" },
    { icon: DollarSign, value: "$25", label: "Per Profile Unlock" },
    { icon: Star, value: "92%", label: "Client Match Rate" },
  ];

  const companyLogos = [
    { name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
    { name: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
    { name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },
    { name: "Singapore", flag: "\u{1F1F8}\u{1F1EC}" },
  ];

  const handleBuyCredits = async (packId: string) => {
    if (!user) {
      router.push("/login?redirect=/hire");
      return;
    }

    setLoadingPack(packId);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Checkout error:", data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setLoadingPack(null);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      router.push("/login?redirect=/hire");
      return;
    }

    if (tier === "ENTERPRISE") {
      window.location.href = "mailto:hello@resourcematch.ph?subject=Enterprise Plan Inquiry";
      return;
    }

    setLoadingTier(tier);
    try {
      const res = await fetch("/api/payments/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.action === "portal") {
          const portalRes = await fetch("/api/payments/portal", { method: "POST" });
          const portalData = await portalRes.json();
          if (portalData.url) {
            window.location.href = portalData.url;
          }
        } else {
          console.error("Subscription error:", data.error);
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Subscription failed:", error);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <>
      <SEO
        title="Hire AI-Vetted Senior Filipino Talent - ResourceMatch"
        description="Pre-vetted senior Filipino talent with 5-10+ years experience. 4-layer AI vetting pipeline. From $25/unlock."
        url="https://resourcematch.ph/hire"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-light/30">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <LogoIcon className="w-8 h-8" color="accent" />
                <span className="text-2xl font-heading font-bold text-slate-900">ResourceMatch</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    <Users className="mr-2 h-4 w-4" />
                    Browse Talent
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-light border border-secondary/30 rounded-full text-primary font-medium animate-fade-in">
                <ShieldCheck className="h-4 w-4" />
                AI-Vetted Senior Talent
              </div>

              <h1
                className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                Hire Senior Talent{" "}
                <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  Vetted by AI
                </span>
              </h1>

              <p
                className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                5-10+ years of experience. Every candidate passes our 4-layer AI vetting pipeline
                before you see their profile.
              </p>

              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
                style={{ animationDelay: "300ms" }}
              >
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl transition-all"
                  >
                    Browse Vetted Talent
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <p
                className="text-sm text-slate-500 animate-fade-in"
                style={{ animationDelay: "400ms" }}
              >
                Browse profiles free. No credit card required.
              </p>
            </div>
          </div>
        </section>

        {/* Candidate Preview Cards */}
        {previewCandidates.length > 0 && (
          <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-light/20">
            <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <Badge className="mb-4 bg-light text-primary border-secondary/30 hover:bg-light">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    AI-Vetted Talent
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                    Meet Our Senior Talent
                  </h2>
                  <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Every expert has passed our 4-layer AI vetting pipeline and brings 5-10+
                    years of domain expertise.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {previewCandidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-secondary p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-full" />

                      <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                          <img
                            src={candidate.avatar}
                            alt={candidate.name}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200"
                          />
                          {candidate.verified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                              <ShieldCheck className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-full">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-green-700">
                            {candidate.vettingScore}/100
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                          {candidate.name}
                        </h3>
                        <p className="text-sm text-slate-600 font-medium">{candidate.title}</p>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>Philippines</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>{candidate.experience} yrs</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                          {verticalLabels[candidate.vertical] || candidate.vertical}
                        </Badge>
                      </div>

                      {candidate.caseStudyTitle && (
                        <div className="mb-3 pb-3 border-b border-slate-100">
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {candidate.caseStudyTitle}
                          </p>
                          {candidate.caseStudyMetrics && (
                            <p className="text-xs text-primary font-medium mt-1">
                              {candidate.caseStudyMetrics}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {candidate.skills.slice(0, 3).map((skill, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 text-xs"
                          >
                            +{candidate.skills.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <Link href={`/profile/${candidate.id}`}>
                        <Button className="w-full bg-secondary hover:bg-primary text-white group-hover:shadow-lg transition-all">
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="h-14 px-8 text-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30"
                    >
                      Browse All Vetted Talent
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="mt-4 text-sm text-slate-500">Browse free, unlock from $25</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Credit Packs */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary hover:bg-secondary/10">
                  <Coins className="w-3 h-3 mr-1" />
                  Pay As You Go
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  Credit Packs
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Buy credits to unlock vetted profiles. Credits never expire — use them whenever
                  you need to hire.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                {creditPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className={`relative rounded-2xl p-6 border-2 text-center transition-all hover:shadow-xl ${
                      pack.popular
                        ? "border-secondary shadow-lg shadow-secondary/20 scale-105"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {pack.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-secondary text-white px-3 py-0.5 text-xs font-bold">
                          BEST VALUE
                        </Badge>
                      </div>
                    )}
                    <div className="text-4xl font-bold text-slate-900 mb-1">{pack.credits}</div>
                    <div className="text-sm text-slate-500 mb-4">
                      {pack.credits === 1 ? "credit" : "credits"}
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">${pack.price}</div>
                    <div className="text-sm text-slate-500 mb-6">${pack.perUnlock} per unlock</div>
                    <Button
                      onClick={() => handleBuyCredits(pack.id)}
                      disabled={loadingPack === pack.id}
                      className={`w-full ${
                        pack.popular
                          ? "bg-secondary hover:bg-secondary/90 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                      }`}
                    >
                      {loadingPack === pack.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          Buy {pack.credits} Credit{pack.credits !== 1 ? "s" : ""}
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-slate-500">
                Credits never expire. Use them across any talent pool, anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Subscription Plans */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-light text-primary border-secondary/30 hover:bg-light">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Monthly Plans
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  Subscription Plans
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Hiring regularly? Save with a monthly subscription and get priority access to new
                  talent.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.tier}
                    className={`relative rounded-2xl p-8 border-2 transition-all hover:shadow-xl bg-white ${
                      plan.popular
                        ? "border-secondary shadow-lg shadow-secondary/20 scale-105"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-secondary text-white px-4 py-1 text-sm font-bold">
                          <Zap className="w-3 h-3 mr-1" />
                          MOST POPULAR
                        </Badge>
                      </div>
                    )}

                    <div className="mb-6">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          plan.color === "secondary"
                            ? "bg-light"
                            : plan.color === "accent"
                              ? "bg-accent/10"
                              : "bg-slate-100"
                        }`}
                      >
                        <plan.icon
                          className={`h-7 w-7 ${
                            plan.color === "secondary"
                              ? "text-primary"
                              : plan.color === "accent"
                                ? "text-accent"
                                : "text-slate-600"
                          }`}
                        />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-500 ml-2">{plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2
                            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              plan.color === "secondary"
                                ? "text-secondary"
                                : plan.color === "accent"
                                  ? "text-accent"
                                  : "text-slate-500"
                            }`}
                          />
                          <span className="text-sm text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={loadingTier === plan.tier}
                      className={`w-full h-12 ${
                        plan.popular
                          ? "bg-primary hover:bg-primary-dark text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                      }`}
                    >
                      {loadingTier === plan.tier ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  </div>
                ))}
              </div>
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
        <section className="py-16 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            />
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
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/80">{stat.label}</div>
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
                Ready to Hire Vetted Senior Talent?
              </h2>
              <p className="text-xl text-slate-600">
                Browse AI-vetted senior talent with 5-10+ years experience. From $25/unlock.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30"
                  >
                    Browse Vetted Talent
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
