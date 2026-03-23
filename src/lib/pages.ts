import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const PAGES_DIR = path.join(process.cwd(), "content", "pages");

export interface LandingPageMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string | null;
  category: string;
  keywords: string[];
  heroImage: string | null;
  heroImageAlt: string | null;
  heroImageCredit: string | null;
  heroImageCreditUrl: string | null;
  ctaTitle: string | null;
  ctaDescription: string | null;
  ctaButtonText: string | null;
  ctaButtonHref: string | null;
}

export interface LandingPage extends LandingPageMeta {
  content: string;
}

function parseFrontmatter(filePath: string): LandingPage {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug: data.slug || path.basename(filePath, ".mdx"),
    title: data.title || "Untitled",
    description: data.description || "",
    date: data.date || "",
    updated: data.updated || null,
    category: data.category || "general",
    keywords: data.keywords || [],
    heroImage: data.hero_image || null,
    heroImageAlt: data.hero_image_alt || null,
    heroImageCredit: data.hero_image_credit || null,
    heroImageCreditUrl: data.hero_image_credit_url || null,
    ctaTitle: data.cta_title || null,
    ctaDescription: data.cta_description || null,
    ctaButtonText: data.cta_button_text || null,
    ctaButtonHref: data.cta_button_href || null,
    content,
  };
}

export function getAllLandingPages(): LandingPageMeta[] {
  if (!fs.existsSync(PAGES_DIR)) return [];

  const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const { content: _, ...meta } = parseFrontmatter(
        path.join(PAGES_DIR, file)
      );
      return meta;
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getLandingPageBySlug(slug: string): LandingPage | null {
  const filePath = path.join(PAGES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return parseFrontmatter(filePath);
}

export function getAllLandingPageSlugs(): string[] {
  if (!fs.existsSync(PAGES_DIR)) return [];
  return fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""));
}
