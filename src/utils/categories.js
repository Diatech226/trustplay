export const normalizeSubCategory = (value = '') => {
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
  const scienceKeys = ['science', 'science-tech', 'science/tech', 'sciencetech', 'technologie', 'technology', 'tech'];
  if (scienceKeys.includes(normalized)) return 'science-tech';
  return normalized || undefined;
};

export const PRIMARY_SUBCATEGORIES = [
  { value: 'news', label: 'News' },
  { value: 'politique', label: 'Politique' },
  { value: 'science-tech', label: 'Science & Tech' },
  { value: 'sport', label: 'Sport' },
  { value: 'cinema', label: 'Cinéma' },
];

export const SECONDARY_SUBCATEGORIES = [
  { value: 'economie', label: 'Économie' },
  { value: 'culture', label: 'Culture' },
  { value: 'portraits', label: 'Portraits' },
];

export const ALL_SUBCATEGORIES = [...PRIMARY_SUBCATEGORIES, ...SECONDARY_SUBCATEGORIES];
