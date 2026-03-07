import { useState } from "react";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/LandingHeader";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { getAllPosts, BLOG_CATEGORIES } from "@/lib/blog";
import type { BlogPostMeta } from "@/lib/blog";

export const getStaticProps: GetStaticProps<{
  posts: BlogPostMeta[];
}> = async () => {
  const posts = getAllPosts();
  return { props: { posts }, revalidate: 3600 };
};

export default function BlogIndex({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const categories = [
    { key: "all", label: "All" },
    ...Object.entries(BLOG_CATEGORIES).map(([key, label]) => ({
      key,
      label,
    })),
  ];

  return (
    <>
      <SEO
        title="Blog - ResourceMatch | Outsourcing Insights & Hiring Guides"
        description="Expert insights on hiring senior Filipino professionals, outsourcing strategy, and building remote teams in Finance, Accounting, and Operations Management."
        url="https://resourcematch.ph/blog"
      />

      <LandingHeader />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Insights & Guides
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert advice on hiring senior Filipino professionals, outsourcing
              best practices, and building high-performing remote teams.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.key
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No articles in this category yet.</p>
              <p className="text-sm mt-2">Check back soon for new content.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
