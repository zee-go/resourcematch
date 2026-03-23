import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/LandingHeader";
import { Footer } from "@/components/Footer";
import { CTABanner } from "@/components/blog/CTABanner";
import { BlogImage } from "@/components/blog/BlogImage";
import { getAllLandingPageSlugs, getLandingPageBySlug } from "@/lib/pages";
import type { LandingPageMeta } from "@/lib/pages";

const mdxComponents = {
  CTABanner,
  BlogImage,
};

interface LandingPageProps {
  page: LandingPageMeta;
  mdxSource: MDXRemoteSerializeResult;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllLandingPageSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<LandingPageProps> = async ({
  params,
}) => {
  const slug = params?.slug as string;
  const page = getLandingPageBySlug(slug);

  if (!page) return { notFound: true };

  const mdxSource = await serialize(page.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
  });

  const { content: _, ...pageMeta } = page;

  return {
    props: { page: pageMeta, mdxSource },
    revalidate: 3600,
  };
};

export default function LandingPage({
  page,
  mdxSource,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const url = `https://resourcematch.ph/${page.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url,
    publisher: {
      "@type": "Organization",
      name: "ResourceMatch",
      url: "https://resourcematch.ph",
    },
  };

  const ctaTitle = page.ctaTitle || "Ready to Hire Senior Filipino Talent?";
  const ctaDescription =
    page.ctaDescription ||
    "Browse our AI-vetted professionals and find your next team member today.";
  const ctaButtonText = page.ctaButtonText || "Browse Vetted Professionals";
  const ctaButtonHref = page.ctaButtonHref || "/dashboard";

  return (
    <>
      <SEO
        title={`${page.title} | ResourceMatch`}
        description={page.description}
        image={
          page.heroImage
            ? `https://resourcematch.ph${page.heroImage}`
            : undefined
        }
        url={url}
      />

      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <LandingHeader />

      <main className="pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-3xl">
          {/* Hero */}
          {page.heroImage && (
            <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden mb-8">
              <Image
                src={page.heroImage}
                alt={page.heroImageAlt || page.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            {page.title}
          </h1>

          <div className="prose-blog">
            <MDXRemote {...mdxSource} components={mdxComponents} />
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
              {ctaTitle}
            </h3>
            <p className="text-muted-foreground mb-5 max-w-lg mx-auto">
              {ctaDescription}
            </p>
            <Link
              href={ctaButtonHref}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {ctaButtonText}
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
