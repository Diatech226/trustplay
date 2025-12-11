import { Suspense } from 'react';
import SearchResults from './search-results';

export const metadata = {
  title: 'Recherche Trust Media',
};

export default function SearchPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;

  return (
    <div className="space-y-4 section-card">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase text-secondary">Recherche avancée</p>
          <h1 className="text-xl font-semibold">Articles et analyses</h1>
          <p className="text-sm text-slate-700">Filtrez par mots-clés, catégorie, date ou popularité.</p>
        </div>
      </header>
      <Suspense fallback={<p className="text-sm text-slate-600">Chargement des résultats...</p>}>
        <SearchResults query={query} category={category} />
      </Suspense>
    </div>
  );
}
