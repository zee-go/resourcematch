import type { GetServerSideProps } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllLandingPages } from "@/lib/pages";

const SITE = "https://resourcematch.ph";

const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/dashboard", changefreq: "daily", priority: "0.9" },
  { path: "/hire", changefreq: "monthly", priority: "0.8" },
  { path: "/jobs", changefreq: "daily", priority: "0.8" },
  { path: "/apply", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "daily", priority: "0.7" },
  { path: "/signup", changefreq: "monthly", priority: "0.6" },
  { path: "/login", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "monthly", priority: "0.3" },
  { path: "/terms", changefreq: "monthly", priority: "0.3" },
];

function generateSitemap(
  blogSlugs: { slug: string; date: string }[],
  landingPages: { slug: string; date: string }[]
): string {
  const staticEntries = staticPages
    .map(
      (p) => `  <url>
    <loc>${SITE}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const blogEntries = blogSlugs
    .map(
      (post) => `  <url>
    <loc>${SITE}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("\n");

  const landingEntries = landingPages
    .map(
      (page) => `  <url>
    <loc>${SITE}/${page.slug}</loc>
    <lastmod>${page.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${landingEntries}
${blogEntries}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const posts = getAllPosts().map((p) => ({ slug: p.slug, date: p.date }));
  const pages = getAllLandingPages().map((p) => ({ slug: p.slug, date: p.date }));
  const sitemap = generateSitemap(posts, pages);

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
