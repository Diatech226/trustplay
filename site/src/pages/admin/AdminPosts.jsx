import { Badge, Button, Pagination, Select, TextInput } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../admin/components/PageShell';
import ResourceTable from '../../admin/components/ResourceTable';
import { apiRequest } from '../../lib/apiClient';
import { normalizeSubCategory } from '../../utils/categories';
import { useRubrics } from '../../hooks/useRubrics';

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'review', label: 'En relecture' },
  { value: 'scheduled', label: 'Planifiés' },
  { value: 'published', label: 'Publiés' },
];

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    subCategory: '',
    tags: '',
    order: 'desc',
    sortBy: 'publishedAt',
    page: 1,
    limit: 10,
  });
  const { rubrics: trustMediaRubrics } = useRubrics('TrustMedia');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalPosts / filters.limit)), [filters.limit, totalPosts]);
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    params.set('startIndex', (filters.page - 1) * filters.limit);
    params.set('limit', filters.limit);
    params.set('order', filters.order);
    params.set('sortBy', filters.sortBy);
    if (filters.search) params.set('searchTerm', filters.search);
    if (filters.subCategory) params.set('subCategory', normalizeSubCategory(filters.subCategory));
    if (filters.tags) params.set('tags', filters.tags);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);

    try {
      const data = await apiRequest(`/api/posts?${params.toString()}`, { auth: true });
      const normalized = (data.posts || data.data?.posts || []).map((post) => ({
        ...post,
        subCategory: normalizeSubCategory(post.subCategory),
      }));
      setPosts(normalized);
      setTotalPosts(data.totalPosts || data.data?.totalPosts || normalized.length);
    } catch (err) {
      setError(err.message || 'Impossible de charger les articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.status, filters.order, filters.sortBy, filters.search, filters.subCategory, filters.tags]);

  const updateStatus = async (post, status) => {
    try {
      await apiRequest(`/api/posts/${post._id}`, {
        method: 'PUT',
        auth: true,
        body: { status, publishedAt: post.publishedAt },
      });
      fetchPosts();
    } catch (err) {
      setError(err.message || 'Impossible de mettre à jour le statut');
    }
  };

  const deletePost = async (postId) => {
    const confirmed = window.confirm('Confirmer la suppression ?');
    if (!confirmed) return;
    try {
      await apiRequest(`/api/posts/${postId}`, { method: 'DELETE', auth: true });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setTotalPosts((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message || 'Suppression impossible');
    }
  };

  const columns = [
    { header: 'Titre', accessor: 'title' },
    { header: 'Rubrique', accessor: 'subCategory' },
    {
      header: 'Statut',
      accessor: 'status',
      cell: (row) => (
        <Badge color='info' className='capitalize'>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Tags',
      accessor: 'tags',
      cell: (row) => (
        <div className='flex flex-wrap gap-1'>
          {(row.tags || []).slice(0, 3).map((tag) => (
            <Badge key={tag} color='gray'>
              #{tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className='flex flex-wrap gap-2'>
          <Button size='xs' color='light' as={Link} to={`/post/${row.slug}`}>
            Voir
          </Button>
          <Button size='xs' color='gray' as={Link} to={`/dashboard/posts/${row._id}/edit`}>
            Éditer
          </Button>
          <Button size='xs' color='warning' onClick={() => updateStatus(row, 'review')}>
            Envoyer en revue
          </Button>
          {row.status !== 'published' ? (
            <Button size='xs' color='success' onClick={() => updateStatus(row, 'published')}>
              Publier
            </Button>
          ) : (
            <Button size='xs' color='light' onClick={() => updateStatus(row, 'draft')}>
              Dépublier
            </Button>
          )}
          <Button size='xs' color='failure' onClick={() => deletePost(row._id)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title='Articles'
      description='Workflow complet : brouillon, relecture, publication et SEO.'
      actions={
        <Button as={Link} to='/dashboard/posts/create' size='sm'>
          Nouvel article
        </Button>
      }
    >
      {error && (
        <div className='mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 dark:border-orange-800 dar\
k:bg-orange-900/30 dark:text-orange-100'>
          {error}
        </div>
      )}

      <div className='mb-4 grid gap-3 md:grid-cols-4'>
        <TextInput
          placeholder='Recherche par titre ou contenu'
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
        />
        <Select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.subCategory}
          onChange={(e) => setFilters((prev) => ({ ...prev, subCategory: e.target.value, page: 1 }))}
        >
          <option value=''>Toutes les rubriques</option>
          {trustMediaRubrics.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </Select>
        <TextInput
          placeholder='Tags (séparés par des virgules)'
          value={filters.tags}
          onChange={(e) => setFilters((prev) => ({ ...prev, tags: e.target.value, page: 1 }))}
        />
      </div>

      <div className='mb-3 flex flex-wrap items-center gap-3'>
        <label className='text-sm font-semibold'>Tri :</label>
        <Select
          value={filters.sortBy}
          onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value, page: 1 }))}
        >
          <option value='publishedAt'>Date de publication</option>
          <option value='updatedAt'>Mise à jour</option>
          <option value='title'>Titre</option>
        </Select>
        <Select
          value={filters.order}
          onChange={(e) => setFilters((prev) => ({ ...prev, order: e.target.value, page: 1 }))}
        >
          <option value='desc'>Décroissant</option>
          <option value='asc'>Croissant</option>
        </Select>
      </div>

      <ResourceTable columns={columns} data={posts} loading={loading} />

      <div className='mt-4 flex items-center justify-between'>
        <p className='text-sm text-slate-600 dark:text-slate-300'>
          {totalPosts} articles au total
        </p>
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          showIcons
        />
      </div>
    </PageShell>
  );
}
