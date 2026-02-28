import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { WhyChoose } from "@/components/WhyChoose";
import { AIComparison } from "@/components/AIComparison";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  return (
    <>
      <SEO
        title="ResourceMatch - AI-Vetted Senior Filipino Professionals"
        description="Hire pre-vetted senior Filipino professionals with 5-10+ years experience. AI-powered 4-layer vetting pipeline. From $25/unlock."
        url="https://resourcematch.ph"
      />
      <main>
        <Hero />
        <WhyChoose />
        <AIComparison />
        <HowItWorks />
      </main>
    </>
  );
}
