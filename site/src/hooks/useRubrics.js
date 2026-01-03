import { useEffect, useMemo, useState } from 'react';
import { fetchRubrics } from '../services/rubrics.service';
import { TRUST_MEDIA_SUBCATEGORIES } from '../utils/categories';

const cache = new Map();

const buildFallback = (scope) => {
  if (scope !== 'TrustMedia') return [];
  return TRUST_MEDIA_SUBCATEGORIES.map((item) => ({
    slug: item.value,
    label: item.label,
    path: item.path,
  }));
};

export const useRubrics = (scope, { fallback = true } = {}) => {
  const [rubrics, setRubrics] = useState(() => cache.get(scope) || []);
  const [loading, setLoading] = useState(Boolean(scope) && !cache.get(scope));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!scope) return () => {};

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchRubrics({ scope });
        const next = data.length ? data : fallback ? buildFallback(scope) : [];
        if (isMounted) {
          cache.set(scope, next);
          setRubrics(next);
          setError(null);
        }
      } catch (err) {
        const next = fallback ? buildFallback(scope) : [];
        if (isMounted) {
          setRubrics(next);
          setError(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fallback, scope]);

  const rubricMap = useMemo(() => {
    return rubrics.reduce((acc, rubric) => {
      if (rubric?.slug) {
        acc[rubric.slug] = rubric;
      }
      return acc;
    }, {});
  }, [rubrics]);

  return { rubrics, rubricMap, loading, error };
};
