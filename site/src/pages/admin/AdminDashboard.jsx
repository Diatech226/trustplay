import { Button } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';
import { HiAnnotation, HiDocumentText, HiOutlineUserGroup } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import KpiCard from '../../admin/components/KpiCard';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { apiRequest } from '../../lib/apiClient';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [totals, setTotals] = useState({ users: 0, posts: 0, comments: 0 });
  const [monthly, setMonthly] = useState({ users: 0, posts: 0, comments: 0 });

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, postsRes, commentsRes] = await Promise.all([
        apiRequest('/api/user/getusers?limit=5', { auth: true }),
        apiRequest('/api/posts?limit=5', { auth: true }),
        apiRequest('/api/comment/getcomments?limit=5', { auth: true }),
      ]);

      setUsers(usersRes.users || []);
      setTotals((prev) => ({ ...prev, users: usersRes.totalUsers || usersRes.count || prev.users }));
      setMonthly((prev) => ({ ...prev, users: usersRes.lastMonthUsers || prev.users }));

      const normalizedPosts = (postsRes.posts || []).map((post) => ({
        ...post,
        status: post.status || 'draft',
      }));
      setPosts(normalizedPosts);
      setTotals((prev) => ({ ...prev, posts: postsRes.totalPosts || normalizedPosts.length || prev.posts }));
      setMonthly((prev) => ({ ...prev, posts: postsRes.lastMonthPosts || prev.posts }));

      setComments(commentsRes.comments || []);
      setTotals((prev) => ({ ...prev, comments: commentsRes.totalComments || commentsRes.total || prev.comments }));
      setMonthly((prev) => ({ ...prev, comments: commentsRes.lastMonthComments || prev.comments }));
    } catch (err) {
      setError(err.message || 'Impossible de récupérer les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const kpis = useMemo(
    () => [
      {
        label: 'Utilisateurs',
        value: totals.users,
        trend: monthly.users,
        icon: HiOutlineUserGroup,
        helper: 'Créations sur les 30 derniers jours',
      },
      {
        label: 'Articles',
        value: totals.posts,
        trend: monthly.posts,
        icon: HiDocumentText,
        helper: 'Pipeline éditorial',
      },
      {
        label: 'Commentaires',
        value: totals.comments,
        trend: monthly.comments,
        icon: HiAnnotation,
        helper: 'Engagement lecteurs',
      },
    ],
    [monthly.comments, monthly.posts, monthly.users, totals.comments, totals.posts, totals.users]
  );

  return (
    <PageShell
      title='Pilotage global'
      description='Suivez vos KPIs éditoriaux, vos campagnes et vos événements en un coup d’œil.'
      actions={
        <Button color='gray' size='sm' onClick={fetchOverview} isProcessing={loading} disabled={loading}>
          Rafraîchir
        </Button>
      }
    >
      {error && (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dar\
k:bg-red-900/30 dark:text-red-200'>
          {error}
        </div>
      )}

      <div className='grid gap-4 md:grid-cols-3'>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className='mt-6 grid gap-6 lg:grid-cols-3'>
        <div className='space-y-3 lg:col-span-2'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Articles récents</h3>
            <Button size='xs' color='light' as={Link} to='/dashboard/posts'>
              Gérer
            </Button>
          </div>
          <ResourceTable
            loading={loading}
            columns={[
              { header: 'Titre', accessor: 'title' },
              { header: 'Rubrique', accessor: 'subCategory' },
              { header: 'Statut', accessor: 'status' },
              {
                header: 'Actions',
                accessor: 'actions',
                cell: (row) => (
                  <div className='flex gap-2'>
                    <Button size='xs' color='light' as={Link} to={`/post/${row.slug}`}>Voir</Button>
                    <Button size='xs' color='gray' as={Link} to={`/dashboard/posts/${row._id}/edit`}>
                      Éditer
                    </Button>
                  </div>
                ),
              },
            ]}
            data={posts}
          />
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Activité commentaires</h3>
            <Button size='xs' color='light' as={Link} to='/dashboard/comments'>
              Modérer
            </Button>
          </div>
          <ResourceTable
            loading={loading}
            columns={[
              { header: 'Auteur', accessor: 'username' },
              { header: 'Contenu', accessor: 'content', cell: (row) => <p className='line-clamp-2'>{row.content}</p> },
              { header: 'Likes', accessor: 'numberOfLikes' },
            ]}
            data={comments}
          />
        </div>
      </div>

      <div className='mt-6 space-y-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Équipe</h3>
          <Button size='xs' color='light' as={Link} to='/dashboard/users'>
            Gérer les rôles
          </Button>
        </div>
        <ResourceTable
          loading={loading}
          columns={[
            { header: 'Utilisateur', accessor: 'username' },
            { header: 'Email', accessor: 'email' },
            { header: 'Rôle', accessor: 'role' },
          ]}
          data={users}
        />
      </div>
    </PageShell>
  );
}
