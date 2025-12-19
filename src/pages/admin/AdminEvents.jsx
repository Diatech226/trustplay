import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoEvents } from '../../admin/config/mockData';

export default function AdminEvents() {
  return (
    <PageShell
      title='Événements'
      description='Gérez dates, lieux, inscriptions et exports CSV.'
      actions={
        <button className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90'>
          Nouvel événement
        </button>
      }
    >
      <ResourceTable
        columns={[
          { header: 'Nom', accessor: 'name' },
          { header: 'Date', accessor: 'date' },
          { header: 'Lieu', accessor: 'location' },
          { header: 'Places', accessor: 'seats' },
        ]}
        data={demoEvents}
      />
    </PageShell>
  );
}
