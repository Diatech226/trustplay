import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoProjects } from '../../admin/config/mockData';

export default function AdminProjects() {
  return (
    <PageShell
      title='Projets'
      description='Brief, livrables, échéances, statut et fichiers associés.'
    >
      <ResourceTable
        columns={[
          { header: 'Nom', accessor: 'name' },
          { header: 'Client', accessor: 'client' },
          { header: 'Statut', accessor: 'status' },
          { header: 'Échéance', accessor: 'due' },
        ]}
        data={demoProjects}
      />
    </PageShell>
  );
}
