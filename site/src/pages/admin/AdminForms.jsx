import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoForms } from '../../admin/config/mockData';

export default function AdminForms() {
  return (
    <PageShell
      title='Formulaires'
      description='Brief clients, feedbacks, inscriptions : centralisez toutes les réponses.'
    >
      <ResourceTable
        columns={[
          { header: 'Nom', accessor: 'name' },
          { header: 'Soumissions', accessor: 'submissions' },
          { header: 'Dernière', accessor: 'last' },
        ]}
        data={demoForms}
      />
    </PageShell>
  );
}
