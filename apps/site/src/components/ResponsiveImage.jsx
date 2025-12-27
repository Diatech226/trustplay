import { resolveMediaUrl } from '../lib/mediaUrls';
import { buildSrcSet, pickVariant, resolveMediaAssetUrl } from '../utils/media';

export const ResponsiveImage = ({
  media,
  fallbackUrl,
  alt,
  variantPreference = 'cover',
  sizes,
  className,
  loading = 'lazy',
}) => {
  if (!media && !fallbackUrl) return null;
  const variants = media?.variants || media;
  const src =
    resolveMediaUrl(
      pickVariant(variants, variantPreference) ||
        pickVariant(variants, 'cover') ||
        pickVariant(variants, 'card') ||
        pickVariant(variants, 'thumb')
    ) || resolveMediaAssetUrl(media, variantPreference);
  const srcSet = variants?.thumb || variants?.card || variants?.cover ? buildSrcSet(variants) : '';
  const finalAlt = alt || media?.alt || media?.title || '';
  const fallback = fallbackUrl ? resolveMediaUrl(fallbackUrl) : '';
  return (
    <img
      src={src || fallback}
      srcSet={srcSet || undefined}
      sizes={srcSet ? sizes : undefined}
      alt={finalAlt}
      className={className}
      loading={loading}
      decoding="async"
    />
  );
};
