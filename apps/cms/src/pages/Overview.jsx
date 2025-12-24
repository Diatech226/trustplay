import { useCallback, useEffect, useState } from 'react';
import { fetchComments } from '../services/comments.service';
import { fetchPosts } from '../services/posts.service';
import { fetchUsers } from '../services/users.service';
import { formatDate } from '../lib/format';
import { useToast } from '../components/ToastProvider';

const initialState = {
  loading: true,
  error: null,
  posts: [],
  comments: [],
  users: [],
  metrics: {
    totalPosts: 0,
    totalEvents: 0,
    totalComments: 0,
    totalUsers: 0,
    lastMonthComments: 0,
    lastMonthUsers: 0,
  },
};

export const Overview = () => {
  const [state, setState] = useState(initialState);
  const { addToast } = useToast();

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const statusFilter = 'draft,review,published,scheduled';
      const [postsResponse, eventsResponse, commentsResponse, usersResponse] = await Promise.all([
        fetchPosts({ limit: 5, order: 'desc', status: statusFilter }),
        fetchPosts({ limit: 5, order: 'desc', category: 'TrustEvent', status: statusFilter }),
        fetchComments({ limit: 5 }),
        fetchUsers({ limit: 5 }),
      ]);

      setState({
        loading: false,
        error: null,
        posts: postsResponse.posts,
        comments: commentsResponse.comments,
        users: usersResponse.users,
        metrics: {
          totalPosts: postsResponse.totalPosts,
          totalEvents: eventsResponse.totalPosts,
          totalComments: commentsResponse.totalComments,
          totalUsers: usersResponse.totalUsers,
          lastMonthComments: commentsResponse.lastMonthComments,
          lastMonthUsers: usersResponse.lastMonthUsers,
        },
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
          <h3>Articles</h3>
          <div className="metric">{state.metrics.totalPosts}</div>
          <p className="helper">Total des articles publiés et brouillons.</p>
        </div>
        <div className="card">
          <h3>Événements</h3>
          <div className="metric">{state.metrics.totalEvents}</div>
          <p className="helper">Total des événements Trust Event.</p>
        </div>
        <div className="card">
          <h3>Commentaires</h3>
          <div className="metric">{state.metrics.totalComments}</div>
          <p className="helper">
            {state.metrics.lastMonthComments ? `${state.metrics.lastMonthComments} sur les 30 derniers jours.` : 'Total modéré.'}
          </p>
        </div>
        <div className="card">
          <h3>Utilisateurs</h3>
          <div className="metric">{state.metrics.totalUsers}</div>
          <p className="helper">
            {state.metrics.lastMonthUsers ? `${state.metrics.lastMonthUsers} inscriptions ce mois-ci.` : 'Total des comptes.'}
          </p>
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
