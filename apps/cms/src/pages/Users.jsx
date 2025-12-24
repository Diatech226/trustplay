import { useCallback, useEffect, useState } from 'react';
import { fetchUsers } from '../services/users.service';
import { formatDate } from '../lib/format';
import { useToast } from '../components/ToastProvider';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUsers({ limit: 50 });
      setUsers(response.users);
    } catch (err) {
      setError(err.message);
      addToast(`Erreur lors du chargement : ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="section">
      <div className="section-header">
        <h2>Utilisateurs</h2>
        <button className="button secondary" onClick={loadUsers}>
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <div className="loader">Chargement des utilisateurs…</div>
      ) : error ? (
        <div className="notice">{error}</div>
      ) : users.length === 0 ? (
        <div className="empty-state">Aucun utilisateur trouvé.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Inscription</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username || '—'}</td>
                <td>{user.email}</td>
                <td>
                  <span className="status-pill">{user.role || 'USER'}</span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
