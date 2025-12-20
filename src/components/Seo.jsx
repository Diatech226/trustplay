import { Helmet } from 'react-helmet-async';

const defaultDescription =
  "Trust Media : actualités, analyses et reportages sur la politique, la science, le sport et le cinéma.";

export default function Seo({
  title = 'Trust Media',
  description = defaultDescription,
  type = 'website',
  image,
  url,
  canonical,
  schema,
  children,
}) {
  const sanitizedDescription = description?.slice(0, 160);
  const canonicalUrl = canonical || url;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={sanitizedDescription} />
      {canonicalUrl && <link rel='canonical' href={canonicalUrl} />}
      <meta property='og:title' content={title} />
      <meta property='og:description' content={sanitizedDescription} />
      <meta property='og:type' content={type} />
      {url && <meta property='og:url' content={url} />}
      {image && <meta property='og:image' content={image} />}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={sanitizedDescription} />
      {image && <meta name='twitter:image' content={image} />}
      {schema && <script type='application/ld+json'>{JSON.stringify(schema)}</script>}
      {children}
    </Helmet>
  );
}
