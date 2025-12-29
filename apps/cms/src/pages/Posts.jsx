import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { createPost, deletePost, fetchPosts, updatePostStatus } from '../services/posts.service';
import { formatDate } from '../lib/format';
import { useConfirm } from '../components/ConfirmDialog';
import { useToast } from '../components/ToastProvider';
import { resolveMediaUrl } from '../lib/mediaUrls';
import { resolveMediaUrlFromAsset } from '../utils/media';
import { useRubrics } from '../hooks/useRubrics';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'review', label: 'Review' },
  { value: 'published', label: 'Publié' },
  { value: 'scheduled', label: 'Planifié' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Toutes' },
  { value: 'TrustMedia', label: 'Trust Media' },
  { value: 'TrustEvent', label: 'Trust Event' },
  { value: 'TrustProduction', label: 'Trust Production' },
];

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Dernière mise à jour' },
  { value: 'createdAt', label: 'Date de création' },
  { value: 'publishedAt', label: 'Date de publication' },
];

const resolvePostId = (post) => post?._id || post?.id;
const resolveAuthorName = (post) =>
  post?.author?.name || post?.authorName || post?.userId?.username || post?.userId?.email || '—';

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [pagination, setPagination] = useState({ startIndex: 0, limit: 20, total: 0 });
  const { confirm } = useConfirm();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const statusValues = searchParams.get('status')?.split(',').filter(Boolean) || [];
    return {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      subCategory: searchParams.get('subCategory') || '',
      author: searchParams.get('author') || '',
      statuses: statusValues,
      publishedFrom: searchParams.get('publishedFrom') || '',
      publishedTo: searchParams.get('publishedTo') || '',
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      order: searchParams.get('order') || 'desc',
    };
  }, [searchParams]);

  const { rubrics: rubricOptions } = useRubrics(filters.category || 'TrustMedia');

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete('startIndex');
    setSearchParams(next, { replace: true });
  };

  const updateStatusFilter = (value) => {
    const nextStatuses = filters.statuses.includes(value)
      ? filters.statuses.filter((item) => item !== value)
      : [...filters.statuses, value];
    updateFilter('status', nextStatuses.join(','));
  };

  const loadPosts = useCallback(
    async ({ reset = false } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const startIndex = reset ? 0 : pagination.startIndex;
        const response = await fetchPosts({
          limit: pagination.limit,
          startIndex,
          order: filters.order,
          status: filters.statuses.length ? filters.statuses.join(',') : undefined,
          category: filters.category || undefined,
          subCategory: filters.subCategory || undefined,
          searchTerm: filters.search || undefined,
          publishedFrom: filters.publishedFrom || undefined,
          publishedTo: filters.publishedTo || undefined,
          sortBy: filters.sortBy || undefined,
          populateMedia: true,
        });
        setPosts((prev) => (reset ? response.posts : [...prev, ...response.posts]));
        setPagination((prev) => ({
          ...prev,
          startIndex: startIndex + response.posts.length,
          total: response.totalPosts,
        }));
      } catch (err) {
        setError(err.message);
        addToast(`Erreur lors du chargement : ${err.message}`, { type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [addToast, filters, pagination.limit, pagination.startIndex]
  );

  useEffect(() => {
    loadPosts({ reset: true });
  }, [loadPosts, location.state?.refresh]);

  const filteredPosts = useMemo(() => {
    const authorQuery = filters.author.toLowerCase();
    if (!authorQuery) return posts;
    return posts.filter((post) => resolveAuthorName(post).toLowerCase().includes(authorQuery));
  }, [filters.author, posts]);

  const handleStatusChange = async (post, nextStatus) => {
    const postId = resolvePostId(post);
    if (!postId || !nextStatus) return;
    const previousStatus = post.status;
    setStatusUpdating((prev) => ({ ...prev, [postId]: true }));
    setPosts((prev) =>
      prev.map((entry) => (resolvePostId(entry) === postId ? { ...entry, status: nextStatus } : entry))
    );
    try {
      await updatePostStatus(postId, nextStatus);
      addToast('Statut mis à jour.', { type: 'success' });
    } catch (error) {
      setPosts((prev) =>
        prev.map((entry) =>
          resolvePostId(entry) === postId ? { ...entry, status: previousStatus } : entry
        )
      );
      addToast(`Mise à jour impossible : ${error.message}`, { type: 'error' });
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDelete = async (postId) => {
    if (!postId) return;
    const accepted = await confirm({
      title: 'Supprimer le post',
      message: 'Cette action est définitive. Voulez-vous supprimer ce contenu ?',
      confirmText: 'Supprimer',
    });
    if (!accepted) return;

    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => resolvePostId(post) !== postId));
      setPagination((prev) => ({ ...prev, total: Math.max(prev.total - 1, 0) }));
      addToast('Post supprimé avec succès.', { type: 'success' });
    } catch (error) {
      addToast(`Suppression impossible : ${error.message}`, { type: 'error' });
    }
  };

  const handleDuplicate = async (post) => {
    const postId = resolvePostId(post);
    if (!postId) return;
    try {
      await createPost({
        title: `${post.title || 'Sans titre'} (copie)`,
        content: post.content || '',
        category: post.category || 'TrustMedia',
        subCategory: post.subCategory || '',
        status: 'draft',
        tags: post.tags || [],
        featured: false,
        image: post.image || '',
        imageOriginal: post.imageOriginal || '',
        imageThumb: post.imageThumb || '',
        imageCover: post.imageCover || '',
        imageMedium: post.imageMedium || '',
        coverMediaId: post.coverMediaId || undefined,
        featuredMediaId: post.featuredMediaId || undefined,
        mediaIds: post.mediaIds || [],
      });
      addToast('Post dupliqué.', { type: 'success' });
      navigate('/posts', { replace: true, state: { refresh: Date.now() } });
    } catch (error) {
      addToast(`Duplication impossible : ${error.message}`, { type: 'error' });
    }
  };

  const canLoadMore = filteredPosts.length < pagination.total;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Articles</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="button" to="/posts/new">
            Nouveau post
          </Link>
          <button className="button secondary" type="button" onClick={() => loadPosts({ reset: true })}>
            Rafraîchir
          </button>
        </div>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <label>
          Recherche
          <input
            placeholder="Titre ou contenu"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
        </label>
        <label>
          Catégorie
          <select
            value={filters.category}
            onChange={(event) => updateFilter('category', event.target.value)}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rubrique / Sous-catégorie
          <select
            value={filters.subCategory}
            onChange={(event) => updateFilter('subCategory', event.target.value)}
          >
            <option value="">Toutes</option>
            {rubricOptions.map((rubric) => (
              <option key={rubric.slug || rubric.value} value={rubric.slug || rubric.value}>
                {rubric.label || rubric.value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Auteur
          <input
            placeholder="Nom ou email"
            value={filters.author}
            onChange={(event) => updateFilter('author', event.target.value)}
          />
        </label>
        <label>
          Date début
          <input
            type="date"
            value={filters.publishedFrom}
            onChange={(event) => updateFilter('publishedFrom', event.target.value)}
          />
        </label>
        <label>
          Date fin
          <input
            type="date"
            value={filters.publishedTo}
            onChange={(event) => updateFilter('publishedTo', event.target.value)}
          />
        </label>
        <label>
          Trier par
          <select value={filters.sortBy} onChange={(event) => updateFilter('sortBy', event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ordre
          <select value={filters.order} onChange={(event) => updateFilter('order', event.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
        {STATUS_OPTIONS.map((option) => (
          <label key={option.value} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={filters.statuses.includes(option.value)}
              onChange={() => updateStatusFilter(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>

      {loading && filteredPosts.length === 0 ? (
        <div className="loader">Chargement des posts…</div>
      ) : error ? (
        <div className="notice">{error}</div>
      ) : filteredPosts.length === 0 ? (
        <div className="empty-state">Aucun post trouvé.</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Couverture</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Catégorie</th>
                <th>Rubrique</th>
                <th>Auteur</th>
                <th>Mis à jour</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => {
                const postId = resolvePostId(post);
                const statusValue = post.status || 'draft';
                const isUpdating = Boolean(statusUpdating[postId]);
                const featuredMedia = post.featuredMedia || post.featuredMediaId || post.coverMedia;
                const featuredUrl =
                  resolveMediaUrlFromAsset(featuredMedia, 'thumb') ||
                  resolveMediaUrl(post.image || post.imageThumb || post.imageCover || post.imageOriginal);
                return (
                  <tr key={postId}>
                    <td>
                      {featuredUrl ? (
                        <img
                          src={featuredUrl}
                          alt={post.title}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        <span className="helper">—</span>
                      )}
                    </td>
                    <td>
                      <strong>{post.title}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span className="status-pill">{statusValue}</span>
                        <select
                          value={statusValue}
                          disabled={isUpdating}
                          onChange={(event) => handleStatusChange(post, event.target.value)}
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {isUpdating ? <span className="helper">Mise à jour…</span> : null}
                      </div>
                    </td>
                    <td>{post.category || '—'}</td>
                    <td>{post.subCategory || '—'}</td>
                    <td>{resolveAuthorName(post)}</td>
                    <td>{formatDate(post.updatedAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link className="button secondary" to={`/posts/${postId}/edit`}>
                          Éditer
                        </Link>
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => handleDuplicate(post)}
                        >
                          Dupliquer
                        </button>
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() =>
                            handleStatusChange(post, statusValue === 'published' ? 'draft' : 'published')
                          }
                        >
                          {statusValue === 'published' ? 'Dépublier' : 'Publier'}
                        </button>
                        <button className="button danger" onClick={() => handleDelete(postId)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="helper">
              {filteredPosts.length} / {pagination.total} posts
            </span>
            {canLoadMore ? (
              <button className="button secondary" type="button" onClick={() => loadPosts()} disabled={loading}>
                Charger plus
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
