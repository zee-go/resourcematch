import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <div className="my-10 rounded-xl bg-light border border-secondary/20 p-6 md:p-8 text-center">
      <h3 className="font-heading text-xl md:text-2xl font-semibold text-primary mb-2">
        Find Your Next Senior Professional
      </h3>
      <p className="text-muted-foreground mb-5 max-w-lg mx-auto">
        Browse AI-vetted Filipino professionals with 5-10+ years of experience
        in Finance, Accounting, and Operations Management.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark !text-white font-semibold px-6 py-3 rounded-lg transition-colors no-underline"
      >
        Browse Vetted Professionals
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
