import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 pt-16">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Premium badge */}
          <div className="flex justify-center mb-8 animate-slide-up">
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm font-semibold border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              AI-Vetted Senior Talent
            </Badge>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-center mb-6 leading-tight animate-slide-up-delay-1">
            Hire Senior Filipino Talent,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Vetted
            </span>{" "}
            by AI
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-muted-foreground text-center max-w-3xl mx-auto mb-12 animate-slide-up-delay-2">
            5-10+ years of experience in e-commerce operations and accounting & finance. Every candidate passes our 4-layer AI vetting pipeline before you see their profile.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up-delay-3">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Browse Vetted Talent
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/apply">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Apply as an Expert
              </Button>
            </Link>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto animate-scale-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">5-10+ Years</div>
                <div className="text-sm text-muted-foreground font-medium">Average Experience</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-card border border-border rounded-2xl p-6 text-center hover:border-accent/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">4-Layer</div>
                <div className="text-sm text-muted-foreground font-medium">AI Vetting Pipeline</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <Star className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">92%</div>
                <div className="text-sm text-muted-foreground font-medium">Client Match Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
