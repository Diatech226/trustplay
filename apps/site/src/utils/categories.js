export const MEDIA_CATEGORY = 'TrustMedia';
export const EVENT_CATEGORY = 'TrustEvent';
export const PRODUCTION_CATEGORY = 'TrustProduction';

export const TRUST_MEDIA_SUBCATEGORIES = [
  { value: 'news', label: 'News', path: '/news' },
  { value: 'politique', label: 'Politique', path: '/politique' },
  { value: 'science-tech', label: 'Science/Tech', path: '/science' },
  { value: 'sport', label: 'Sport', path: '/sport' },
  { value: 'cinema', label: 'Cinéma', path: '/cinema' },
];

const TRUST_MEDIA_SUBCATEGORY_VALUES = TRUST_MEDIA_SUBCATEGORIES.map(({ value }) => value);
const TRUST_MEDIA_SUBCATEGORY_SET = new Set(TRUST_MEDIA_SUBCATEGORY_VALUES);
const TRUST_MEDIA_FALLBACK_SUBCATEGORY = 'news';

const TRUST_MEDIA_SUBCATEGORY_MAP = TRUST_MEDIA_SUBCATEGORIES.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

export const getSubCategoryMeta = (value) => TRUST_MEDIA_SUBCATEGORY_MAP[value];
export const getSubCategoryLabel = (value) => TRUST_MEDIA_SUBCATEGORY_MAP[value]?.label;

export const normalizeSubCategory = (value = '') => {
  if (value === null || value === undefined) return undefined;
  const normalized = value.toString().trim().toLowerCase();
  const map = {
    news: 'news',
    actualites: 'news',
    'actualités': 'news',
    politique: 'politique',
    politics: 'politique',
    sport: 'sport',
    sports: 'sport',
    cinema: 'cinema',
    'cinéma': 'cinema',
    movie: 'cinema',
    film: 'cinema',
    economie: 'economie',
    'économie': 'economie',
    economy: 'economie',
    culture: 'culture',
    portraits: 'portraits',
  };

  if (map[normalized]) return map[normalized];
  const scienceKeys = ['science', 'science-tech', 'science/tech', 'science & tech', 'sciencetech', 'technologie', 'technology', 'tech'];
  if (scienceKeys.includes(normalized)) return 'science-tech';
  return normalized || undefined;
};

export const normalizeTrustMediaSubCategory = (value = '') => {
  const normalized = normalizeSubCategory(value);
  if (!normalized) return undefined;
  return TRUST_MEDIA_SUBCATEGORY_SET.has(normalized) ? normalized : TRUST_MEDIA_FALLBACK_SUBCATEGORY;
};

export const PRIMARY_SUBCATEGORIES = TRUST_MEDIA_SUBCATEGORIES.map(({ value, label }) => ({ value, label }));

export const SECONDARY_SUBCATEGORIES = [
  { value: 'economie', label: 'Économie' },
  { value: 'culture', label: 'Culture' },
  { value: 'portraits', label: 'Portraits' },
];

export const ALL_SUBCATEGORIES = [...PRIMARY_SUBCATEGORIES, ...SECONDARY_SUBCATEGORIES];
