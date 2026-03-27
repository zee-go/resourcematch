import type { GetStaticProps } from "next";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/LandingHeader";
import { Hero } from "@/components/Hero";
import { WhyChoose } from "@/components/WhyChoose";
import { AIComparison } from "@/components/AIComparison";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { getAllPosts, type BlogPostMeta } from "@/lib/blog";

interface HomeProps {
  latestPosts: BlogPostMeta[];
}

export default function Home({ latestPosts }: HomeProps) {
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

        {latestPosts.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-7xl">
              <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-2">
                Latest Insights
              </h2>
              <p className="text-muted-foreground text-center mb-10">
                Guides on hiring Filipino professionals and building remote teams
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="bg-background rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border group"
                  >
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">
                      {post.category?.replace(/_/g, " ") || "Insights"}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground mt-2 mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.description}
                    </p>
                    <span className="inline-block mt-4 text-sm font-medium text-primary group-hover:underline">
                      Read more →
                    </span>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  href="/blog"
                  className="inline-block px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
                >
                  View All Articles
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts().slice(0, 3);
  return { props: { latestPosts: posts }, revalidate: 3600 };
};
