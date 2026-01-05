import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
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
              <Shield className="w-4 h-4 mr-2" />
              Exclusive Network for Top 5% Filipino Talent
            </Badge>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-center mb-6 leading-tight animate-slide-up-delay-1">
            Connect with{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Pre-Vetted Filipino Talent
            </span>{" "}
            Ready to Join Your Team
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-muted-foreground text-center max-w-3xl mx-auto mb-12 animate-slide-up-delay-2">
            500+ verified professionals. Browse free, unlock contacts from $1.50-$3. Plans starting at $49/month.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up-delay-3">
            <Link href="/hire">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Find Talent
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Apply as Professional
            </Button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto animate-scale-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">$49/mo</div>
                <div className="text-sm text-muted-foreground font-medium">Starter Plan with 15 Unlocks</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-card border border-border rounded-2xl p-6 text-center hover:border-accent/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">500+</div>
                <div className="text-sm text-muted-foreground font-medium">Verified Professionals</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">95%</div>
                <div className="text-sm text-muted-foreground font-medium">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}