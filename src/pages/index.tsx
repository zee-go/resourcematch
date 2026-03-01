import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/LandingHeader";
import { Hero } from "@/components/Hero";
import { WhyChoose } from "@/components/WhyChoose";
import { AIComparison } from "@/components/AIComparison";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  return (
    <>
      <SEO
        title="ResourceMatch - AI-Vetted Senior Filipino Talent"
        description="Hire pre-vetted senior Filipino talent with 5-10+ years experience. AI-powered 4-layer vetting pipeline. From $25/unlock."
        url="https://resourcematch.ph"
      />
      <LandingHeader />
      <main>
        <Hero />
        <WhyChoose />
        <AIComparison />
        <div id="how-it-works">
          <HowItWorks />
        </div>
      </main>
    </>
  );
}
