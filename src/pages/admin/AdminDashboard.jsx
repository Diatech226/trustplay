import KpiCard from '../../admin/components/KpiCard';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoActivity, demoCampaigns, demoEvents } from '../../admin/config/mockData';

export default function AdminDashboard() {
  return (
    <PageShell
      title='Pilotage global'
      description='Suivez vos KPIs éditoriaux, vos campagnes et vos événements en un coup d’œil.'
    >
      <div className='grid gap-4 md:grid-cols-4'>
        <KpiCard label='Articles publiés' value='128' trend={8} helper='Volumes sur les 30 derniers jours' />
        <KpiCard label='Pages actives' value='14' trend={3} helper='Landing & microsites' />
        <KpiCard label='Événements à venir' value={demoEvents.length} helper='Gestion des inscriptions' />
        <KpiCard label='Campagnes actives' value={demoCampaigns.length} helper='Social, Ads, Email' />
      </div>

      <div className='mt-6 grid gap-6 lg:grid-cols-2'>
        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Campagnes en cours</h3>
          <ResourceTable
            columns={[
              { header: 'Nom', accessor: 'name' },
              { header: 'Type', accessor: 'type' },
              { header: 'Budget', accessor: 'budget' },
              { header: 'Statut', accessor: 'status' },
            ]}
            data={demoCampaigns}
          />
        </div>

        <div className='space-y-3'>
          <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Journal d’activité</h3>
          <ResourceTable
            columns={[
              { header: 'Acteur', accessor: 'actor' },
              { header: 'Action', accessor: 'action' },
              { header: 'Cible', accessor: 'target' },
              { header: 'Quand', accessor: 'ts' },
            ]}
            data={demoActivity}
          />
        </div>
      </div>
    </PageShell>
  );
}
