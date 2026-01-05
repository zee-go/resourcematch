import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { WhyChoose } from "@/components/WhyChoose";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  return (
    <>
      <SEO 
        title="ResourceMatch.AI - Connect with Pre-Vetted Filipino Talent"
        description="500+ verified professionals. Browse free, unlock from $1.50-$3. Plans from $49/month with up to 40 unlocks included."
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