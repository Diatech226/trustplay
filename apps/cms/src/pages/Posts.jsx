import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { deletePost, fetchPosts, updatePostStatus } from '../services/posts.service';
import { formatDate } from '../lib/format';
import { useConfirm } from '../components/ConfirmDialog';
import { useToast } from '../components/ToastProvider';

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [statusUpdating, setStatusUpdating] = useState({});
  const { confirm } = useConfirm();
  const { addToast } = useToast();
  const location = useLocation();

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPosts({
        limit: 100,
        order: 'desc',
        status: 'draft,review,published,scheduled,archived',
      });
      setPosts(response.posts);
    } catch (err) {
      setError(err.message);
      addToast(`Erreur lors du chargement : ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts, location.state?.refresh]);

  const filteredPosts = useMemo(() => {
    if (!query) return posts;
    const lower = query.toLowerCase();
    return posts.filter((post) => post.title?.toLowerCase().includes(lower));
  }, [posts, query]);

  const resolvePostId = (post) => post?._id || post?.id;
  const normalizeStatus = (value) => (typeof value === 'string' ? value.toLowerCase() : '');
  const STATUS_LABELS = {
    draft: 'Brouillon',
    published: 'Publié',
    archived: 'Archivé',
    review: 'Review',
    scheduled: 'Planifié',
  };
  const QUICK_STATUS_OPTIONS = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'published', label: 'Publié' },
    { value: 'archived', label: 'Archivé' },
  ];

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
      addToast('Post supprimé avec succès.', { type: 'success' });
    } catch (error) {
      addToast(`Suppression impossible : ${error.message}`, { type: 'error' });
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>Articles</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Rechercher un titre"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Link className="button" to="/posts/new">
            Nouveau post
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loader">Chargement des posts…</div>
      ) : error ? (
        <div className="notice">{error}</div>
      ) : filteredPosts.length === 0 ? (
        <div className="empty-state">Aucun post trouvé.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Catégorie</th>
              <th>Statut</th>
              <th>Mis à jour</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => {
              const postId = resolvePostId(post);
              const statusValue = normalizeStatus(post.status);
              const statusLabel = STATUS_LABELS[statusValue] || post.status || '—';
              const selectValue = QUICK_STATUS_OPTIONS.some((option) => option.value === statusValue)
                ? statusValue
                : '';
              const isUpdating = Boolean(statusUpdating[postId]);
              return (
              <tr key={postId}>
                <td>{post.title}</td>
                <td>{post.category}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="status-pill">{statusLabel}</span>
                    <select
                      value={selectValue}
                      disabled={isUpdating}
                      onChange={(event) => handleStatusChange(post, event.target.value)}
                    >
                      <option value="" disabled>
                        Modifier…
                      </option>
                      {QUICK_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {isUpdating ? <span className="helper">Mise à jour…</span> : null}
                  </div>
                </td>
                <td>{formatDate(post.updatedAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link className="button secondary" to={`/posts/${postId}/edit`}>
                      Éditer
                    </Link>
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
      )}
    </div>
  );
};
