import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/LandingHeader";
import { Footer } from "@/components/Footer";
import { BlogHero } from "@/components/blog/BlogHero";
import { CTABanner } from "@/components/blog/CTABanner";
import { BlogImage } from "@/components/blog/BlogImage";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from "@/lib/blog-seo";
import type { BlogPostMeta } from "@/lib/blog";

const mdxComponents = {
  CTABanner,
  BlogImage,
};

interface ArticlePageProps {
  post: BlogPostMeta;
  mdxSource: MDXRemoteSerializeResult;
  relatedPosts: BlogPostMeta[];
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<ArticlePageProps> = async ({
  params,
}) => {
  const slug = params?.slug as string;
  const post = getPostBySlug(slug);

  if (!post) return { notFound: true };

  const mdxSource = await serialize(post.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
  });

  const { content: _, ...postMeta } = post;
  const relatedPosts = getRelatedPosts(postMeta, 3);

  return {
    props: { post: postMeta, mdxSource, relatedPosts },
    revalidate: 3600,
  };
};

export default function BlogArticle({
  post,
  mdxSource,
  relatedPosts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const url = `https://resourcematch.ph/blog/${post.slug}`;
  const articleJsonLd = generateArticleJsonLd(post, url);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(post.title, post.slug);

  return (
    <>
      <SEO
        title={`${post.title} | ResourceMatch Blog`}
        description={post.description}
        image={
          post.heroImage
            ? `https://resourcematch.ph${post.heroImage}`
            : undefined
        }
        url={url}
        type="article"
        publishedTime={post.date}
        modifiedTime={post.updated}
      />

      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </Head>

      <LandingHeader />

      <main className="pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <BlogHero post={post} />

          <div className="prose-blog">
            <MDXRemote {...mdxSource} components={mdxComponents} />
          </div>

          {/* End CTA */}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
              Ready to Hire Senior Filipino Talent?
            </h3>
            <p className="text-muted-foreground mb-5 max-w-lg mx-auto">
              Browse our AI-vetted professionals and find your next team member
              today.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Browse Vetted Professionals
            </Link>
          </div>
        </article>

        <div className="container mx-auto px-4 max-w-7xl">
          <RelatedPosts posts={relatedPosts} />
        </div>
      </main>

      <Footer />
    </>
  );
}
