import { useCallback, useEffect, useState } from 'react';
import { fetchComments } from '../services/comments.service';
import { fetchPosts } from '../services/posts.service';
import { fetchUsers } from '../services/users.service';
import { fetchMedia } from '../services/media.service';
import { fetchEvents } from '../services/events.service';
import { fetchAnalyticsSummary } from '../services/analytics.service';
import { formatDate } from '../lib/format';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../context/AuthContext';
import { AccessDenied } from '../components/AccessDenied';
import { Link } from 'react-router-dom';

const initialState = {
  loading: true,
  error: null,
  posts: [],
  comments: [],
  users: [],
  media: [],
  events: [],
  metrics: {
    totalPosts: 0,
    draftPosts: 0,
    reviewPosts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    totalEvents: 0,
    totalMedia: 0,
    totalComments: 0,
    totalUsers: 0,
  },
  adminRestricted: false,
  adminError: null,
};

export const Overview = () => {
  const [state, setState] = useState(initialState);
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null, adminError: null }));
    try {
      const statusFilter = 'draft,review,published,scheduled';
      const [postsResponse, eventsResponse, mediaResponse] = await Promise.all([
        fetchPosts({ limit: 5, order: 'desc', status: statusFilter }),
        fetchEvents({ limit: 5, order: 'desc' }),
        fetchMedia({ limit: 5, startIndex: 0, order: 'desc' }),
      ]);
      let summaryResult = null;
      let commentsResponse = { comments: [], totalComments: 0 };
      let usersResponse = { users: [], totalUsers: 0 };
      let adminRestricted = false;
      let adminError = null;

      try {
        summaryResult = await fetchAnalyticsSummary();
      } catch (summaryError) {
        if (summaryError?.status === 403) {
          adminRestricted = true;
          adminError = 'Accès admin requis.';
        } else {
          addToast(`Résumé indisponible : ${summaryError.message}`, { type: 'error' });
        }
      }

      const [commentsResult, usersResult] = await Promise.allSettled([
        fetchComments({ limit: 5 }),
        fetchUsers({ limit: 5 }),
      ]);

      if (commentsResult.status === 'fulfilled') {
        commentsResponse = commentsResult.value;
      } else if (commentsResult.reason?.status === 403) {
        adminRestricted = true;
        adminError = 'Accès admin requis.';
      } else {
        adminError = commentsResult.reason?.message || 'Impossible de charger les commentaires.';
      }

      if (usersResult.status === 'fulfilled') {
        usersResponse = usersResult.value;
      } else if (usersResult.reason?.status === 403) {
        adminRestricted = true;
        adminError = adminError || 'Accès admin requis.';
      } else {
        adminError = adminError || usersResult.reason?.message || 'Impossible de charger les utilisateurs.';
      }

      if (summaryResult?.posts && adminError && !adminRestricted) {
        addToast(adminError, { type: 'error' });
      }

      setState({
        loading: false,
        error: null,
        posts: postsResponse.posts,
        comments: commentsResponse.comments,
        users: usersResponse.users,
        media: mediaResponse.media,
        events: eventsResponse.events || eventsResponse.posts || [],
        metrics: {
          totalPosts: summaryResult?.posts?.total ?? postsResponse.totalPosts,
          draftPosts: summaryResult?.posts?.draft ?? 0,
          reviewPosts: summaryResult?.posts?.review ?? 0,
          publishedPosts: summaryResult?.posts?.published ?? 0,
          scheduledPosts: summaryResult?.posts?.scheduled ?? 0,
          totalEvents: summaryResult?.events?.total ?? eventsResponse.totalEvents,
          totalMedia: summaryResult?.media?.total ?? mediaResponse.totalMedia,
          totalComments: summaryResult?.comments?.total ?? commentsResponse.totalComments,
          totalUsers: summaryResult?.users?.total ?? usersResponse.totalUsers,
        },
        adminRestricted,
        adminError,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      addToast(`Impossible de charger le dashboard : ${error.message}`, { type: 'error' });
    }
  }, [addToast, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (state.adminRestricted && !isAdmin) {
    return <AccessDenied message="Vous devez être administrateur pour accéder au dashboard." />;
  }

  return (
    <div>
      <div className="card-grid">
        <Link className="card" to="/posts">
          <h3>Articles</h3>
          <div className="metric">{state.metrics.totalPosts}</div>
          <p className="helper">Total des articles publiés et brouillons.</p>
        </Link>
        <Link className="card" to="/posts?status=draft">
          <h3>Brouillons</h3>
          <div className="metric">{state.metrics.draftPosts}</div>
          <p className="helper">Articles en attente de publication.</p>
        </Link>
        <Link className="card" to="/posts?status=published">
          <h3>Publiés</h3>
          <div className="metric">{state.metrics.publishedPosts}</div>
          <p className="helper">Articles en ligne.</p>
        </Link>
        <Link className="card" to="/posts?status=scheduled">
          <h3>Planifiés</h3>
          <div className="metric">{state.metrics.scheduledPosts}</div>
          <p className="helper">Articles planifiés.</p>
        </Link>
        <Link className="card" to="/events">
          <h3>Événements</h3>
          <div className="metric">{state.metrics.totalEvents}</div>
          <p className="helper">Total des événements Trust Event.</p>
        </Link>
        <Link className="card" to="/media">
          <h3>Médias</h3>
          <div className="metric">{state.metrics.totalMedia}</div>
          <p className="helper">Total des médias disponibles.</p>
        </Link>
        <Link className="card" to="/comments">
          <h3>Commentaires</h3>
          <div className="metric">{state.metrics.totalComments}</div>
          <p className="helper">Commentaires à modérer.</p>
        </Link>
        <Link className="card" to="/users">
          <h3>Utilisateurs</h3>
          <div className="metric">{state.metrics.totalUsers}</div>
          <p className="helper">Total des comptes.</p>
        </Link>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Derniers articles</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link className="button secondary" to="/posts">
              Voir tout
            </Link>
            <button className="button secondary" onClick={loadData}>
              Rafraîchir
            </button>
          </div>
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
          <Link className="button secondary" to="/comments">
            Voir tout
          </Link>
        </div>
        {state.loading ? (
          <div className="loader">Chargement des commentaires…</div>
        ) : state.adminRestricted ? (
          <div className="empty-state">Accès admin requis.</div>
        ) : state.adminError ? (
          <div className="notice">{state.adminError}</div>
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

      <div className="section">
        <div className="section-header">
          <h2>Derniers médias</h2>
          <Link className="button secondary" to="/media">
            Voir tout
          </Link>
        </div>
        {state.loading ? (
          <div className="loader">Chargement des médias…</div>
        ) : state.media.length === 0 ? (
          <div className="empty-state">Aucun média récent.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Ajouté le</th>
              </tr>
            </thead>
            <tbody>
              {state.media.map((item) => (
                <tr key={item._id || item.id}>
                  <td>{item.title || item.name}</td>
                  <td>{item.type || item.kind || item.mimeType}</td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Derniers événements</h2>
          <Link className="button secondary" to="/events">
            Voir tout
          </Link>
        </div>
        {state.loading ? (
          <div className="loader">Chargement des événements…</div>
        ) : state.events.length === 0 ? (
          <div className="empty-state">Aucun événement récent.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {state.events.map((event) => (
                <tr key={event._id || event.id}>
                  <td>{event.title}</td>
                  <td>
                    <span className="status-pill">{event.status || 'draft'}</span>
                  </td>
                  <td>{formatDate(event.eventDate || event.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
