import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import CategoryPageLayout from '../components/CategoryPageLayout';
import NotFound from './NotFound';
import { useRubrics } from '../hooks/useRubrics';

export default function RubricPage() {
  const { rubricSlug } = useParams();
  const { rubrics, rubricMap, loading } = useRubrics('TrustMedia');

  const rubric = useMemo(() => {
    if (!rubricSlug) return null;
    return rubricMap[rubricSlug] || rubrics.find((item) => item.slug === rubricSlug);
  }, [rubricMap, rubricSlug, rubrics]);

  if (!loading && !rubric) {
    return <NotFound />;
  }

  return (
    <CategoryPageLayout
      title={rubric?.label || rubricSlug}
      subCategory={rubricSlug}
      path={`/${rubricSlug}`}
      description={rubric?.description || ''}
    />
  );
}
