import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Seo from '../components/Seo';
import { useRubrics } from '../hooks/useRubrics';
import { MEDIA_CATEGORY } from '../utils/categories';

export default function Rubriques() {
  const { rubrics, loading, error } = useRubrics('TrustMedia');
  const buildSearchUrl = (subCategory) => {
    const urlParams = new URLSearchParams({ category: MEDIA_CATEGORY });
    if (subCategory) {
      urlParams.set('subCategory', subCategory);
    }
    return `/search?${urlParams.toString()}`;
  };

  return (
    <main className='min-h-screen bg-mist/60 py-8 dark:bg-slate-950'>
      <Seo
        title='Rubriques | Trust Media'
        description="Retrouvez toutes les rubriques Trust Media et explorez les dernières publications."
      />
      <PageContainer className='space-y-6'>
        <PageHeader
          kicker='Rubriques Trust Media'
          title='Toutes les rubriques'
          description='Accédez rapidement aux sujets qui vous intéressent.'
        />

        {error && (
          <p className='rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800'>
            Impossible de charger les rubriques pour le moment.
          </p>
        )}

        {loading ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`rubric-skeleton-${index}`}
                className='h-24 animate-pulse rounded-2xl bg-white shadow-subtle ring-1 ring-subtle dark:bg-slate-900 dark:ring-slate-800'
              />
            ))}
          </div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {rubrics.map((rubric) => (
              <Link
                key={rubric.slug}
                to={buildSearchUrl(rubric.slug)}
                className='group rounded-2xl border border-subtle bg-white p-5 shadow-subtle transition hover:-translate-y-1 hover:shadow-card dark:border-slate-800 dark:bg-slate-900'
              >
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-primary'>Rubrique</p>
                <h3 className='mt-2 text-xl font-bold text-primary group-hover:text-ocean'>
                  {rubric.label}
                </h3>
                {rubric.description && (
                  <p className='mt-2 text-sm text-slate-600 dark:text-slate-300'>
                    {rubric.description}
                  </p>
                )}
              </Link>
            ))}
            {!loading && rubrics.length === 0 && (
              <p className='col-span-full rounded-xl border border-dashed border-subtle bg-subtle/30 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200'>
                Aucune rubrique disponible pour le moment.
              </p>
            )}
          </div>
        )}
      </PageContainer>
    </main>
  );
}
