import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  updateUserRole,
} from '../services/users.service';
import { formatDate } from '../lib/format';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../components/ConfirmDialog';

const ROLE_OPTIONS = ['ADMIN', 'EDITOR', 'AUTHOR', 'USER'];
const EMPTY_FORM = {
  username: '',
  email: '',
  role: 'USER',
  password: '',
};

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPassword, setResetPassword] = useState(false);
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const { confirm } = useConfirm();
  const isAdmin = currentUser?.role === 'ADMIN';

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalUsers / limit)), [totalUsers, limit]);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      setUsers([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUsers({
        page,
        limit,
        search,
        role: roleFilter,
        sort: sortOrder,
      });
      setUsers(response.users);
      setTotalUsers(response.totalUsers);
    } catch (err) {
      setError(err.message);
      addToast(`Erreur lors du chargement : ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast, isAdmin, limit, page, roleFilter, search, sortOrder]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingUser && resetPassword && !form.password) {
      addToast('Veuillez saisir un nouveau mot de passe.', { type: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const payload = {
          username: form.username,
          email: form.email,
          role: form.role,
        };
        if (resetPassword && form.password) {
          payload.password = form.password;
        }
        await updateUser(editingUser._id, payload);
        addToast('Utilisateur mis à jour.', { type: 'success' });
      } else {
        await createUser(form);
        addToast('Utilisateur créé avec succès.', { type: 'success' });
      }
      setForm(EMPTY_FORM);
      setEditingUser(null);
      setResetPassword(false);
      await loadUsers();
    } catch (err) {
      addToast(err.message || 'Impossible de sauvegarder.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'USER',
      password: '',
    });
    setResetPassword(false);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setResetPassword(false);
  };

  const handleDelete = async (user) => {
    const accepted = await confirm({
      title: 'Supprimer cet utilisateur',
      message: `Supprimer ${user.email} ? Cette action est définitive.`,
      confirmText: 'Supprimer',
    });
    if (!accepted) return;
    try {
      await deleteUser(user._id);
      addToast('Utilisateur supprimé.', { type: 'success' });
      await loadUsers();
    } catch (err) {
      addToast(err.message || 'Suppression impossible.', { type: 'error' });
    }
  };

  const handleToggleAdmin = async (user) => {
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await updateUserRole(user._id, nextRole);
      addToast(
        nextRole === 'ADMIN'
          ? 'Utilisateur promu en admin.'
          : 'Utilisateur rétrogradé.',
        { type: 'success' }
      );
      await loadUsers();
    } catch (err) {
      addToast(err.message || 'Action impossible.', { type: 'error' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="section">
        <div className="section-header">
          <h2>Utilisateurs</h2>
        </div>
        <div className="empty-state">Accès admin requis pour consulter les utilisateurs.</div>
      </div>
    );
  }

  return (
    <>
      <div className="section">
        <div className="section-header">
          <h2>{editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}</h2>
          {editingUser ? (
            <button className="button secondary" type="button" onClick={handleCancelEdit}>
              Annuler
            </button>
          ) : null}
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Nom d’utilisateur
            <input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="ex: camille"
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="ex: camille@email.com"
              required
            />
          </label>
          <label>
            Rôle
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          {editingUser ? (
            <label>
              <span>Réinitialiser le mot de passe ?</span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={resetPassword}
                  onChange={(event) => setResetPassword(event.target.checked)}
                />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={form.password}
                  disabled={!resetPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                />
              </div>
            </label>
          ) : (
            <label>
              Mot de passe
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Minimum 8 caractères"
                required
              />
            </label>
          )}
          <div>
            <button className="button" type="submit" disabled={saving}>
              {saving ? 'Sauvegarde...' : editingUser ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Utilisateurs ({totalUsers})</h2>
          <button className="button secondary" onClick={loadUsers}>
            Rafraîchir
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            placeholder="Rechercher un nom ou un email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tous les rôles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value);
              setPage(1);
            }}
          >
            <option value="desc">Tri : plus récents</option>
            <option value="asc">Tri : plus anciens</option>
          </select>
        </div>

        {loading ? (
          <div className="loader">Chargement des utilisateurs…</div>
        ) : error ? (
          <div className="notice">{error}</div>
        ) : users.length === 0 ? (
          <div className="empty-state">Aucun utilisateur trouvé.</div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Inscription</th>
                  <th>Actions</th>
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
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="button secondary" onClick={() => handleEdit(user)}>
                          Éditer
                        </button>
                        <button className="button secondary" onClick={() => handleToggleAdmin(user)}>
                          {user.role === 'ADMIN' ? 'Rétrograder admin' : 'Promouvoir admin'}
                        </button>
                        <button className="button danger" onClick={() => handleDelete(user)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button
                className="button secondary"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                Page précédente
              </button>
              <div className="helper">
                Page {page} / {totalPages}
              </div>
              <button
                className="button secondary"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
              >
                Page suivante
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
