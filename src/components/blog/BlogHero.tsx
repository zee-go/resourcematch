import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/lib/blog";

interface BlogHeroProps {
  post: BlogPostMeta;
}

export function BlogHero({ post }: BlogHeroProps) {
  const categoryLabel = BLOG_CATEGORIES[post.category] || post.category;

  return (
    <header className="mb-8">
      <div className="mb-4">
        <span className="inline-block text-sm font-semibold uppercase tracking-wider text-accent">
          {categoryLabel}
        </span>
      </div>

      <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
        {post.title}
      </h1>

      <p className="text-lg text-muted-foreground mb-6">{post.description}</p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          {post.author}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {post.readingTime} min read
        </span>
      </div>

      {post.heroImage && (
        <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden">
          <Image
            src={post.heroImage}
            alt={post.heroImageAlt || post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          {post.heroImageCredit && (
            <div className="absolute bottom-0 right-0 bg-black/50 text-white/80 text-xs px-2 py-1 rounded-tl">
              Photo by{" "}
              {post.heroImageCreditUrl ? (
                <a
                  href={post.heroImageCreditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {post.heroImageCredit}
                </a>
              ) : (
                post.heroImageCredit
              )}{" "}
              / Unsplash
            </div>
          )}
        </div>
      )}
    </header>
  );
}
