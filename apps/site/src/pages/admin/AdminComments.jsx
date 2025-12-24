import { Button, Select, TextInput } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { apiRequest } from '../../lib/apiClient';

export default function AdminComments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({ postId: '', search: '' });

  const fetchPosts = async () => {
    try {
      const data = await apiRequest('/api/posts?limit=50', { auth: true });
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message || 'Impossible de charger les articles');
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '/api/comment/getcomments?limit=50';
      if (filters.postId) {
        endpoint = `/api/comment/getPostComments/${filters.postId}`;
      }
      const data = await apiRequest(endpoint, { auth: true });
      const list = data.comments || data.data?.comments || [];
      const normalized = list
        .filter((comment) =>
          filters.search ? comment.content?.toLowerCase().includes(filters.search.toLowerCase()) : true
        )
        .map((comment) => ({
          ...comment,
          postTitle: comment.post?.title || comment.postTitle,
        }));
      setComments(normalized);
    } catch (err) {
      setError(err.message || 'Impossible de récupérer les commentaires');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id) => {
    const confirmed = window.confirm('Supprimer ce commentaire ?');
    if (!confirmed) return;
    try {
      await apiRequest(`/api/comment/deleteComment/${id}`, { method: 'DELETE', auth: true });
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message || 'Suppression impossible');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.postId]);

  const postOptions = useMemo(
    () =>
      posts.map((post) => ({
        value: post._id,
        label: post.title,
      })),
    [posts]
  );

  return (
    <PageShell
      title='Modération des commentaires'
      description='Approuvez, rejetez ou marquez les commentaires comme spam.'
      actions={
        <Button color='gray' size='sm' onClick={fetchComments} isProcessing={loading} disabled={loading}>
          Rafraîchir
        </Button>
      }
    >
      {error && (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200'>
          {error}
        </div>
      )}

      <div className='mb-4 grid gap-3 md:grid-cols-3'>
        <Select
          value={filters.postId}
          onChange={(e) => setFilters((prev) => ({ ...prev, postId: e.target.value }))}
          aria-label='Filtrer par article'
        >
          <option value=''>Tous les articles</option>
          {postOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <TextInput
          placeholder='Rechercher dans le contenu'
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <Button color='light' onClick={fetchComments} disabled={loading}>
          Appliquer les filtres
        </Button>
      </div>

      <ResourceTable
        loading={loading}
        columns={[
          { header: 'Auteur', accessor: 'username' },
          {
            header: 'Article',
            accessor: 'postTitle',
            cell: (row) =>
              row.postTitle ? (
                <Link className='text-primary hover:underline' to={`/post/${row.postSlug || row.postId}`}>
                  {row.postTitle}
                </Link>
              ) : (
                '—'
              ),
          },
          { header: 'Contenu', accessor: 'content', cell: (row) => <p className='line-clamp-2'>{row.content}</p> },
          { header: 'Likes', accessor: 'numberOfLikes' },
          {
            header: 'Actions',
            accessor: 'actions',
            cell: (row) => (
              <div className='flex gap-2'>
                <Button size='xs' color='gray' as={Link} to={`/post/${row.postSlug || row.postId}`}>
                  Voir
                </Button>
                <Button size='xs' color='failure' onClick={() => deleteComment(row._id)}>
                  Supprimer
                </Button>
              </div>
            ),
          },
        ]}
        data={comments}
      />
    </PageShell>
  );
}
