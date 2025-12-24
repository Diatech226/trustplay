import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { deletePost, fetchPosts } from '../services/posts.service';
import { formatDate } from '../lib/format';
import { useConfirm } from '../components/ConfirmDialog';
import { useToast } from '../components/ToastProvider';

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
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
        status: 'draft,review,published,scheduled',
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

  const handleDelete = async (postId) => {
    const accepted = await confirm({
      title: 'Supprimer le post',
      message: 'Cette action est définitive. Voulez-vous supprimer ce contenu ?',
      confirmText: 'Supprimer',
    });
    if (!accepted) return;

    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
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
            {filteredPosts.map((post) => (
              <tr key={post._id}>
                <td>{post.title}</td>
                <td>{post.category}</td>
                <td>
                  <span className="status-pill">{post.status}</span>
                </td>
                <td>{formatDate(post.updatedAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link className="button secondary" to={`/posts/${post._id}/edit`}>
                      Éditer
                    </Link>
                    <button className="button danger" onClick={() => handleDelete(post._id)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
