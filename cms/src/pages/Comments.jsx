import { useCallback, useEffect, useState } from 'react';
import { deleteComment, fetchComments } from '../services/comments.service';
import { formatDate } from '../lib/format';
import { useConfirm } from '../components/ConfirmDialog';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../context/AuthContext';

export const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { confirm } = useConfirm();
  const { addToast } = useToast();
  const { user, status } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const loadComments = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      setComments([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetchComments({ limit: 50 });
      setComments(response.comments);
    } catch (err) {
      let message = err.message;
      if (err.status === 401) {
        message = 'Session expirée. Veuillez vous reconnecter.';
      } else if (err.status === 403) {
        message = 'Accès admin requis pour consulter les commentaires.';
      }
      setError(message);
      addToast(`Erreur lors du chargement : ${message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast, isAdmin]);

  useEffect(() => {
    if (status === 'loading') return;
    loadComments();
  }, [loadComments, status]);

  const handleDelete = async (commentId) => {
    const accepted = await confirm({
      title: 'Supprimer le commentaire',
      message: 'Cette action est définitive. Voulez-vous supprimer ce commentaire ?',
      confirmText: 'Supprimer',
    });
    if (!accepted) return;

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
      addToast('Commentaire supprimé.', { type: 'success' });
    } catch (error) {
      addToast(`Suppression impossible : ${error.message}`, { type: 'error' });
    }
  };

  if (status === 'loading') {
    return (
      <div className="section">
        <div className="section-header">
          <h2>Commentaires</h2>
        </div>
        <div className="loader">Chargement des commentaires…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="section">
        <div className="section-header">
          <h2>Commentaires</h2>
        </div>
        <div className="empty-state">Accès admin requis pour consulter les commentaires.</div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>Commentaires</h2>
        <button className="button secondary" onClick={loadComments}>
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <div className="loader">Chargement des commentaires…</div>
      ) : error ? (
        <div className="notice">{error}</div>
      ) : comments.length === 0 ? (
        <div className="empty-state">Aucun commentaire à modérer.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Auteur</th>
              <th>Commentaire</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment._id}>
                <td>{comment.userId?.username || comment.userId?.email || 'Anonyme'}</td>
                <td>{comment.content}</td>
                <td>{formatDate(comment.createdAt)}</td>
                <td>
                  <button className="button danger" onClick={() => handleDelete(comment._id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
