import type { BlogPostMeta } from "@/lib/blog";
import { BlogCard } from "./BlogCard";

interface RelatedPostsProps {
  posts: BlogPostMeta[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-border">
      <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
        Related Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
