import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { WhyChoose } from "@/components/WhyChoose";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  return (
    <>
      <SEO 
        title="ResourceMatch.AI - Connect with Pre-Vetted Filipino Talent"
        description="500+ verified professionals. AI-powered matching. Pay-per-contact pricing starting at $3. Connect with experienced Filipino remote professionals."
        url="https://resourcematch.ai"
      />
      <main>
        <Hero />
        <WhyChoose />
        <HowItWorks />
      </main>
    </>
  );
}