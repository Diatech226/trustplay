import { resolveMediaUrl } from '../lib/mediaUrls';

export const pickVariant = (variants, key) => {
  if (!variants) return '';
  const candidate = variants[key];
  if (!candidate) return '';
  return candidate.url || candidate;
};

export const buildSrcSet = (variants = {}) => {
  const entries = [
    { key: 'thumb', width: 400 },
    { key: 'card', width: 800 },
    { key: 'cover', width: 1600 },
  ];
  const parts = entries
    .map(({ key, width }) => {
      const url = pickVariant(variants, key);
      if (!url) return null;
      return `${resolveMediaUrl(url)} ${width}w`;
    })
    .filter(Boolean);
  return parts.join(', ');
};

export const resolveMediaAssetUrl = (media, preferred = 'cover') => {
  if (!media) return '';
  const variants = media.variants || {};
  const variantUrl =
    pickVariant(variants, preferred) ||
    pickVariant(variants, 'cover') ||
    pickVariant(variants, 'card') ||
    pickVariant(variants, 'thumb');
  return resolveMediaUrl(variantUrl || media.original?.url || media.url);
};
