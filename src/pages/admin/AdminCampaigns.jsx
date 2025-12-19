import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoCampaigns } from '../../admin/config/mockData';

export default function AdminCampaigns() {
  return (
    <PageShell
      title='Campagnes'
      description='Social, ads, email : objectifs, budgets, KPIs et planning.'
      actions={
        <button className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90'>
          Nouvelle campagne
        </button>
      }
    >
      <ResourceTable
        columns={[
          { header: 'Nom', accessor: 'name' },
          { header: 'Type', accessor: 'type' },
          { header: 'Budget', accessor: 'budget' },
          { header: 'Statut', accessor: 'status' },
        ]}
        data={demoCampaigns}
      />
    </PageShell>
  );
}
