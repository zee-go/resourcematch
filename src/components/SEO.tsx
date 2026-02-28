import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEOElements({
  title = "ResourceMatch - AI-Vetted Senior Filipino Professionals",
  description = "Hire pre-vetted senior Filipino professionals with 5-10+ years experience. AI-powered vetting across resume analysis, scenario assessments, and video interviews. From $25/unlock.",
  image = "/og-image.png",
  url,
}: SEOProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </>
  );
}

export function SEO(props: SEOProps) {
  return (
    <Head>
      <SEOElements {...props} />
    </Head>
  );
}