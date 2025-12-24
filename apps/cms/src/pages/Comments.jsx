import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { formatDate } from '../lib/format';
import { useConfirm } from '../components/ConfirmDialog';
import { useToast } from '../components/ToastProvider';

export const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { confirm } = useConfirm();
  const { addToast } = useToast();

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/comment/getcomments?limit=50');
      setComments(response?.comments || response?.data?.comments || []);
    } catch (err) {
      setError(err.message);
      addToast(`Erreur lors du chargement : ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleDelete = async (commentId) => {
    const accepted = await confirm({
      title: 'Supprimer le commentaire',
      message: 'Cette action est définitive. Voulez-vous supprimer ce commentaire ?',
      confirmText: 'Supprimer',
    });
    if (!accepted) return;

    try {
      await apiClient.del(`/api/comment/deleteComment/${commentId}`);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
      addToast('Commentaire supprimé.', { type: 'success' });
    } catch (error) {
      addToast(`Suppression impossible : ${error.message}`, { type: 'error' });
    }
  };

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
