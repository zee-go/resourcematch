import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPostMeta;
}

export function BlogCard({ post }: BlogCardProps) {
  const categoryLabel = BLOG_CATEGORIES[post.category] || post.category;

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {post.heroImage ? (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={post.heroImage}
              alt={post.heroImageAlt || post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <span className="text-4xl font-heading font-bold text-primary/20">
              RM
            </span>
          </div>
        )}

        <div className="p-5">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-accent mb-2">
            {categoryLabel}
          </span>

          <h3 className="font-heading font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {post.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} min read
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
