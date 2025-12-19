import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';

const users = [
  { id: 1, name: 'Camille', role: 'ADMIN', email: 'camille@trust.fr' },
  { id: 2, name: 'Louis', role: 'EDITOR', email: 'louis@trust.fr' },
  { id: 3, name: 'Nina', role: 'MANAGER', email: 'nina@trust.fr' },
];

export default function AdminUsers() {
  return (
    <PageShell
      title='Utilisateurs & rôles'
      description='Attribuez des rôles (ADMIN, MANAGER, EDITOR, VIEWER) et sécurisez les accès.'
      actions={
        <button className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90'>
          Inviter un membre
        </button>
      }
    >
      <ResourceTable
        columns={[
          { header: 'Nom', accessor: 'name' },
          { header: 'Email', accessor: 'email' },
          { header: 'Rôle', accessor: 'role' },
        ]}
        data={users}
      />
    </PageShell>
  );
}
