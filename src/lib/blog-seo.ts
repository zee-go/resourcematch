import type { BlogPostMeta } from "./blog";

export function generateArticleJsonLd(post: BlogPostMeta, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.heroImage
      ? `https://resourcematch.ph${post.heroImage}`
      : "https://resourcematch.ph/og-image.jpg",
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: {
      "@type": "Organization",
      name: "ResourceMatch",
      url: "https://resourcematch.ph",
    },
    publisher: {
      "@type": "Organization",
      name: "ResourceMatch",
      logo: {
        "@type": "ImageObject",
        url: "https://resourcematch.ph/logo-icon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export function generateBreadcrumbJsonLd(postTitle: string, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://resourcematch.ph",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://resourcematch.ph/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: postTitle,
        item: `https://resourcematch.ph/blog/${slug}`,
      },
    ],
  };
}
