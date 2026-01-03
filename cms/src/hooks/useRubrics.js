import { useCallback, useEffect, useState } from 'react';
import { fetchRubrics } from '../services/rubrics.service';

export const useRubrics = (scope, { includeInactive = false } = {}) => {
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(Boolean(scope));
  const [error, setError] = useState(null);

  const loadRubrics = useCallback(async () => {
    if (!scope) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRubrics({
        scope,
        includeInactive: includeInactive ? 'true' : undefined,
      });
      setRubrics(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive, scope]);

  useEffect(() => {
    loadRubrics();
  }, [loadRubrics]);

  return { rubrics, loading, error, reload: loadRubrics };
};
