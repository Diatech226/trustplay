import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoPages } from '../../admin/config/mockData';

export default function AdminPages() {
  return (
    <PageShell
      title='Pages & landing'
      description='Construisez des pages modulaires (hero, services, témoignages, CTA) avec ordre des sections.'
      actions={
        <button className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90'>
          Nouvelle page
        </button>
      }
    >
      <ResourceTable
        columns={[
          { header: 'Titre', accessor: 'title' },
          { header: 'Sections', accessor: 'sections' },
          { header: 'Statut', accessor: 'status' },
        ]}
        data={demoPages}
      />
    </PageShell>
  );
}
