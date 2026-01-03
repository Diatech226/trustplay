import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoNewsletter } from '../../admin/config/mockData';

export default function AdminNewsletter() {
  return (
    <PageShell
      title='Newsletter'
      description='Orchestrez vos campagnes emailing avec ciblage et planning.'
      actions={
        <button className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90'>
          Nouvelle newsletter
        </button>
      }
    >
      <ResourceTable
        columns={[
          { header: 'Nom', accessor: 'name' },
          { header: 'Audience', accessor: 'audience' },
          { header: 'Statut', accessor: 'status' },
        ]}
        data={demoNewsletter}
      />
    </PageShell>
  );
}
