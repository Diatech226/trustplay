import { useCallback, useEffect, useMemo, useState } from 'react';
import { createRubric, deleteRubric, fetchRubrics, updateRubric } from '../services/rubrics.service';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/format';

const SCOPES = ['TrustMedia', 'TrustEvent', 'TrustProduction', 'Media'];

const EMPTY_FORM = {
  scope: 'TrustMedia',
  label: '',
  slug: '',
  description: '',
  order: 0,
  isActive: true,
};

export const Rubrics = () => {
  const [rubrics, setRubrics] = useState([]);
  const [filterScope, setFilterScope] = useState('TrustMedia');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingRubric, setEditingRubric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const { user: currentUser, status } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const loadRubrics = useCallback(async () => {
    if (!isAdmin) {
      setRubrics([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRubrics({ scope: filterScope, includeInactive: 'true' });
      setRubrics(data);
    } catch (err) {
      setError(err.message);
      addToast(`Impossible de charger les rubriques : ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast, filterScope, isAdmin]);

  useEffect(() => {
    if (status === 'loading') return;
    loadRubrics();
  }, [loadRubrics, status]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.label.trim()) {
      addToast('Le libellé est requis.', { type: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (editingRubric) {
        await updateRubric(editingRubric._id, form);
        addToast('Rubrique mise à jour.', { type: 'success' });
      } else {
        await createRubric(form);
        addToast('Rubrique créée.', { type: 'success' });
      }
      setForm(EMPTY_FORM);
      setEditingRubric(null);
      await loadRubrics();
    } catch (err) {
      addToast(err.message || 'Impossible de sauvegarder.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rubric) => {
    setEditingRubric(rubric);
    setForm({
      scope: rubric.scope,
      label: rubric.label || '',
      slug: rubric.slug || '',
      description: rubric.description || '',
      order: rubric.order ?? 0,
      isActive: rubric.isActive !== false,
    });
  };

  const handleCancelEdit = () => {
    setEditingRubric(null);
    setForm(EMPTY_FORM);
  };

  const handleToggleActive = async (rubric) => {
    try {
      await updateRubric(rubric._id, { isActive: !rubric.isActive });
      addToast('Statut mis à jour.', { type: 'success' });
      await loadRubrics();
    } catch (err) {
      addToast(err.message || 'Impossible de mettre à jour.', { type: 'error' });
    }
  };

  const handleDelete = async (rubric) => {
    const accepted = await confirm({
      title: 'Supprimer cette rubrique',
      message: `Supprimer la rubrique ${rubric.label} ?`,
      confirmText: 'Supprimer',
    });
    if (!accepted) return;
    try {
      await deleteRubric(rubric._id);
      addToast('Rubrique supprimée.', { type: 'success' });
      await loadRubrics();
    } catch (err) {
      addToast(err.message || 'Suppression impossible.', { type: 'error' });
    }
  };

  const sortedRubrics = useMemo(() => {
    return [...rubrics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [rubrics]);

  if (status === 'loading') {
    return (
      <div className="section">
        <div className="section-header">
          <h2>Rubriques</h2>
        </div>
        <div className="loader">Chargement des rubriques…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="section">
        <div className="section-header">
          <h2>Rubriques</h2>
        </div>
        <div className="empty-state">Accès admin requis.</div>
      </div>
    );
  }

  return (
    <>
      <div className="section">
        <div className="section-header">
          <h2>{editingRubric ? 'Modifier une rubrique' : 'Créer une rubrique'}</h2>
          {editingRubric ? (
            <button className="button secondary" type="button" onClick={handleCancelEdit}>
              Annuler
            </button>
          ) : null}
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Scope
            <select
              value={form.scope}
              onChange={(event) => setForm((prev) => ({ ...prev, scope: event.target.value }))}
            >
              {SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          </label>
          <label>
            Libellé
            <input
              value={form.label}
              onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
              placeholder="ex: Politique"
              required
            />
          </label>
          <label>
            Slug
            <input
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              placeholder="ex: politique"
            />
          </label>
          <label>
            Ordre
            <input
              type="number"
              value={form.order}
              onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Optionnel"
            />
          </label>
          <label>
            Actif
            <select
              value={form.isActive ? 'true' : 'false'}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.value === 'true' }))}
            >
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </label>
          <div>
            <button className="button" type="submit" disabled={saving}>
              {saving ? 'Sauvegarde...' : editingRubric ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Rubriques</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={filterScope} onChange={(event) => setFilterScope(event.target.value)}>
              {SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
            <button className="button secondary" type="button" onClick={loadRubrics}>
              Rafraîchir
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loader">Chargement des rubriques…</div>
        ) : error ? (
          <div className="notice">{error}</div>
        ) : sortedRubrics.length === 0 ? (
          <div className="empty-state">Aucune rubrique disponible.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Slug</th>
                <th>Scope</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th>Création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRubrics.map((rubric) => (
                <tr key={rubric._id}>
                  <td>{rubric.label}</td>
                  <td>{rubric.slug}</td>
                  <td>{rubric.scope}</td>
                  <td>{rubric.order ?? 0}</td>
                  <td>
                    <span className="status-pill">{rubric.isActive ? 'Actif' : 'Inactif'}</span>
                  </td>
                  <td>{formatDate(rubric.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="button secondary" onClick={() => handleEdit(rubric)}>
                        Éditer
                      </button>
                      <button className="button secondary" onClick={() => handleToggleActive(rubric)}>
                        {rubric.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button className="button danger" onClick={() => handleDelete(rubric)}>
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
    </>
  );
};
