import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string | null;
  author: string;
  category: string;
  tags: string[];
  keywords: string[];
  readingTime: number;
  heroImage: string | null;
  heroImageAlt: string | null;
  heroImageCredit: string | null;
  heroImageCreditUrl: string | null;
  relatedPosts: string[];
  internalLinks: { anchor: string; href: string }[];
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function parseFrontmatter(filePath: string): BlogPost {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug: data.slug || path.basename(filePath, ".mdx"),
    title: data.title || "Untitled",
    description: data.description || "",
    date: data.date || "",
    updated: data.updated || null,
    author: data.author || "ResourceMatch",
    category: data.category || "general",
    tags: data.tags || [],
    keywords: data.keywords || [],
    readingTime: data.reading_time || Math.ceil(stats.minutes),
    heroImage: data.hero_image || null,
    heroImageAlt: data.hero_image_alt || null,
    heroImageCredit: data.hero_image_credit || null,
    heroImageCreditUrl: data.hero_image_credit_url || null,
    relatedPosts: data.related_posts || [],
    internalLinks: data.internal_links || [],
    content,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const { content: _, ...meta } = parseFrontmatter(
        path.join(BLOG_DIR, file)
      );
      return meta;
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return parseFrontmatter(filePath);
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""));
}

export function getRelatedPosts(
  post: BlogPostMeta,
  count = 3
): BlogPostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);

  const scored = all.map((p) => {
    let score = 0;
    if (p.category === post.category) score += 3;
    const sharedTags = p.tags.filter((t) => post.tags.includes(t));
    score += sharedTags.length;
    return { post: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.post);
}

export const BLOG_CATEGORIES: Record<string, string> = {
  outsourcing_strategy: "Outsourcing Strategy",
  finance_accounting: "Finance & Accounting",
  operations_management: "Operations Management",
  hiring_best_practices: "Hiring Best Practices",
  industry_insights: "Industry Insights",
};
