import { useEffect, useMemo, useState } from 'react';
import KpiCard from '../../admin/components/KpiCard';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { fetchJson } from '../../lib/apiClient';

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchJson('/api/analytics/summary');
        setSummary(data.data || data.summary || data);
      } catch (err) {
        setError(err.message || 'Impossible de récupérer les analytics');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  const chartData = summary?.dailyViews || [];
  const chartMax = useMemo(
    () => Math.max(...chartData.map((item) => item.count), 1),
    [chartData]
  );

  return (
    <PageShell
      title='Analytics'
      description='Suivez les KPIs clés : trafic éditorial, partages et interactions événementielles.'
      loading={loading}
    >
      {error && (
        <p className='rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800'>
          {error}
        </p>
      )}

      <div className='grid gap-4 md:grid-cols-4'>
        <KpiCard
          label='Vues articles (30j)'
          value={summary?.pageViews || 0}
          helper='Pages publiques'
          trend={summary?.uniquePages || 0}
          trendLabel='pages vues'
        />
        <KpiCard
          label='Pages uniques'
          value={summary?.uniquePages || 0}
          helper='Slug distincts'
          trend={0}
        />
        <KpiCard
          label='Partages (30j)'
          value={summary?.shares || 0}
          helper='CTA partage et social'
          trend={0}
        />
        <KpiCard
          label='Inscriptions events'
          value={summary?.eventSignups || 0}
          helper='Formulaires agenda'
          trend={0}
        />
      </div>

      <div className='mt-6 grid gap-6 lg:grid-cols-3'>
        <div className='space-y-3 lg:col-span-2'>
          <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Trafic 7 derniers jours</h3>
          <div className='rounded-2xl border border-subtle bg-white p-4 shadow-subtle dark:border-slate-800 dark:bg-slate-900'>
            {chartData.length === 0 && <p className='text-sm text-slate-500'>Pas encore de trafic mesuré.</p>}
            {chartData.length > 0 && (
              <div className='flex items-end gap-3'>
                {chartData.map((item) => (
                  <div key={item.date} className='flex flex-1 flex-col items-center gap-2'>
                    <div
                      className='w-full rounded-t-md bg-gradient-to-b from-ocean to-primary shadow-subtle'
                      style={{ height: `${(item.count / chartMax) * 180}px` }}
                      title={`${item.count} vues le ${item.date}`}
                    />
                    <span className='text-xs text-slate-500 dark:text-slate-400'>{item.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Articles les plus lus</h3>
          <ResourceTable
            columns={[
              { header: 'Slug', accessor: 'slug' },
              { header: 'Titre', accessor: 'title' },
              { header: 'Vues', accessor: 'count' },
            ]}
            data={summary?.topArticles || []}
            emptyState='Pas encore de données.'
          />
        </div>
      </div>

      <div className='mt-6 space-y-3'>
        <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Événements récents (30j)</h3>
        <ResourceTable
          columns={[
            { header: 'Type', accessor: 'type' },
            { header: 'Page', accessor: 'page' },
            { header: 'Slug/ID', accessor: 'slug' },
            { header: 'Label', accessor: 'label' },
            { header: 'Date', accessor: 'createdAt' },
          ]}
          data={(summary?.latestEvents || []).map((event) => ({
            ...event,
            createdAt: new Date(event.createdAt).toLocaleString('fr-FR'),
          }))}
          emptyState='Aucun évènement logué pour le moment.'
        />
      </div>
    </PageShell>
  );
}
