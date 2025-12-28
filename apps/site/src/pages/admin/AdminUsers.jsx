import { Button, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { apiRequest } from '../../lib/apiClient';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/api/user/getusers', { auth: true });
      const list = data.users || [];
      setUsers(list);
    } catch (err) {
      setError(err.message || 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    search ? user.username?.toLowerCase().includes(search.toLowerCase()) || user.email?.includes(search) : true
  );

  return (
    <PageShell
      title='Utilisateurs & rôles'
      description='Attribuez des rôles (ADMIN, USER) et sécurisez les accès.'
      actions={
        <Button color='gray' size='sm' onClick={fetchUsers} isProcessing={loading} disabled={loading}>
          Rafraîchir
        </Button>
      }
    >
      {error && (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200'>
          {error}
        </div>
      )}

      <div className='mb-4 max-w-md'>
        <TextInput
          placeholder='Rechercher par nom ou email'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ResourceTable
        loading={loading}
        columns={[
          { header: 'Nom', accessor: 'username' },
          { header: 'Email', accessor: 'email' },
          { header: 'Rôle', accessor: 'role' },
          {
            header: 'Statut',
            accessor: 'status',
            cell: (row) => (row.role === 'ADMIN' ? 'Admin' : 'Utilisateur'),
          },
        ]}
        data={filteredUsers}
      />
    </PageShell>
  );
}
