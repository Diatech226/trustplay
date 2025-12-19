import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoClients } from '../../admin/config/mockData';

export default function AdminClients() {
  return (
    <PageShell
      title='Clients'
      description='Fiches clients, contacts, notes et statut de la relation.'
      actions={
        <button className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90'>
          Nouveau client
        </button>
      }
    >
      <ResourceTable
        columns={[
          { header: 'Nom', accessor: 'name' },
          { header: 'Contact', accessor: 'contact' },
          { header: 'Statut', accessor: 'status' },
        ]}
        data={demoClients}
      />
    </PageShell>
  );
}
