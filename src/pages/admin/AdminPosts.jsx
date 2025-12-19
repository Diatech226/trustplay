import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { demoPosts } from '../../admin/config/mockData';

export default function AdminPosts() {
  return (
    <PageShell
      title='Articles'
      description='Workflow complet : brouillon, publication, SEO, modération des commentaires.'
      actions={
        <a
          href='/dashboard/posts/create'
          className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90'
        >
          Nouvel article
        </a>
      }
    >
      <ResourceTable
        columns={[
          { header: 'Titre', accessor: 'title' },
          { header: 'Statut', accessor: 'status' },
          { header: 'Auteur', accessor: 'author' },
          { header: 'Modifié le', accessor: 'updatedAt' },
        ]}
        data={demoPosts}
      />
    </PageShell>
  );
}
