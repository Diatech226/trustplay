import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';

const comments = [
  { id: 1, author: 'Julie', target: 'Article « Roadmap Q3 »', status: 'En attente', date: '2024-05-11' },
  { id: 2, author: 'Mathieu', target: 'Page « Offres agence »', status: 'Approuvé', date: '2024-05-09' },
];

export default function AdminComments() {
  return (
    <PageShell
      title='Modération des commentaires'
      description='Approuvez, rejetez ou marquez les commentaires comme spam.'
    >
      <ResourceTable
        columns={[
          { header: 'Auteur', accessor: 'author' },
          { header: 'Cible', accessor: 'target' },
          { header: 'Statut', accessor: 'status' },
          { header: 'Date', accessor: 'date' },
        ]}
        data={comments}
      />
    </PageShell>
  );
}
