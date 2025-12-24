import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoActivity } from '../../admin/config/mockData';

export default function AdminActivity() {
  return (
    <PageShell
      title='Logs & QA'
      description='Audit log des actions admin pour assurer la conformité et la qualité.'
    >
      <ResourceTable
        columns={[
          { header: 'Acteur', accessor: 'actor' },
          { header: 'Action', accessor: 'action' },
          { header: 'Cible', accessor: 'target' },
          { header: 'Quand', accessor: 'ts' },
        ]}
        data={demoActivity}
      />
    </PageShell>
  );
}
