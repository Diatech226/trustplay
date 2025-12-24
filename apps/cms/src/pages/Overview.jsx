import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { formatDate } from '../lib/format';
import { useToast } from '../components/ToastProvider';

const initialState = {
  loading: true,
  error: null,
  posts: [],
  comments: [],
  users: [],
};

export const Overview = () => {
  const [state, setState] = useState(initialState);
  const { addToast } = useToast();

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [postsResponse, commentsResponse, usersResponse] = await Promise.all([
        apiClient.get('/api/posts?limit=5&order=desc'),
        apiClient.get('/api/comment/getcomments?limit=5'),
        apiClient.get('/api/user/getusers?limit=5'),
      ]);

      setState({
        loading: false,
        error: null,
        posts: postsResponse?.posts || postsResponse?.data?.posts || [],
        comments: commentsResponse?.comments || commentsResponse?.data?.comments || [],
        users: usersResponse?.users || usersResponse?.data?.users || [],
      });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      addToast(`Impossible de charger le dashboard : ${error.message}`, { type: 'error' });
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <div className="card-grid">
        <div className="card">
          <h3>Articles récents</h3>
          <div className="metric">{state.posts.length}</div>
          <p className="helper">Sur les 5 derniers contenus.</p>
        </div>
        <div className="card">
          <h3>Commentaires</h3>
          <div className="metric">{state.comments.length}</div>
          <p className="helper">Dernières réactions modérées.</p>
        </div>
        <div className="card">
          <h3>Utilisateurs</h3>
          <div className="metric">{state.users.length}</div>
          <p className="helper">Nouveaux comptes enregistrés.</p>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Derniers articles</h2>
          <button className="button secondary" onClick={loadData}>
            Rafraîchir
          </button>
        </div>
        {state.loading ? (
          <div className="loader">Chargement des articles…</div>
        ) : state.error ? (
          <div className="notice">{state.error}</div>
        ) : state.posts.length === 0 ? (
          <div className="empty-state">Aucun article disponible.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Statut</th>
                <th>Mis à jour</th>
              </tr>
            </thead>
            <tbody>
              {state.posts.map((post) => (
                <tr key={post._id || post.id}>
                  <td>{post.title}</td>
                  <td>
                    <span className="status-pill">{post.status || 'draft'}</span>
                  </td>
                  <td>{formatDate(post.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Derniers commentaires</h2>
        </div>
        {state.loading ? (
          <div className="loader">Chargement des commentaires…</div>
        ) : state.comments.length === 0 ? (
          <div className="empty-state">Aucun commentaire pour le moment.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Auteur</th>
                <th>Extrait</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {state.comments.map((comment) => (
                <tr key={comment._id || comment.id}>
                  <td>{comment.userId?.username || 'Anonyme'}</td>
                  <td>{comment.content?.slice(0, 60)}...</td>
                  <td>{formatDate(comment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
