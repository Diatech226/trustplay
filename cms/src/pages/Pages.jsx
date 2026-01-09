import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { deletePage, fetchPages, updatePageStatus } from '../services/pages.service';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../components/ConfirmDialog';
import { formatDate } from '../lib/format';
import { AccessDenied } from '../components/AccessDenied';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'scheduled', label: 'Planifié' },
];

const resolvePageId = (page) => page?._id || page?.id;

export const Pages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', visibility: '' });
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const location = useLocation();

  const loadPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const response = await fetchPages({
        searchTerm: filters.search || undefined,
        status: filters.status || undefined,
        visibility: filters.visibility || undefined,
        order: 'desc',
        sortBy: 'updatedAt',
      });
      setPages(response.pages);
    } catch (err) {
      setError(err.message);
      setErrorCode(err.status || null);
      addToast(`Erreur lors du chargement : ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast, filters.search, filters.status, filters.visibility]);

  useEffect(() => {
    loadPages();
  }, [loadPages, location.state?.refresh]);

  const handleStatusChange = async (page, nextStatus) => {
    const pageId = resolvePageId(page);
    if (!pageId) return;
    const previousStatus = page.status;
    setPages((prev) => prev.map((item) => (resolvePageId(item) === pageId ? { ...item, status: nextStatus } : item)));
    try {
      await updatePageStatus(pageId, nextStatus);
      addToast('Statut mis à jour.', { type: 'success' });
    } catch (err) {
      setPages((prev) =>
        prev.map((item) => (resolvePageId(item) === pageId ? { ...item, status: previousStatus } : item))
      );
      addToast(`Mise à jour impossible : ${err.message}`, { type: 'error' });
    }
  };

  const handleDelete = async (pageId) => {
    if (!pageId) return;
    const accepted = await confirm({
      title: 'Supprimer la page',
      message: 'Cette action est définitive. Voulez-vous supprimer cette page ? ',
      confirmText: 'Supprimer',
    });
    if (!accepted) return;

    try {
      await deletePage(pageId);
      setPages((prev) => prev.filter((item) => resolvePageId(item) !== pageId));
      addToast('Page supprimée.', { type: 'success' });
    } catch (err) {
      addToast(`Suppression impossible : ${err.message}`, { type: 'error' });
    }
  };

  if (errorCode === 403) {
    return <AccessDenied message="Vous n'avez pas accès aux pages CMS." />;
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>Pages</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="button" to="/pages/new">
            Nouvelle page
          </Link>
          <button className="button secondary" type="button" onClick={loadPages}>
            Rafraîchir
          </button>
        </div>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <label>
          Recherche
          <input
            placeholder="Titre ou slug"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
        </label>
        <label>
          Statut
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="">Tous</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Visibilité
          <select
            value={filters.visibility}
            onChange={(event) => setFilters((prev) => ({ ...prev, visibility: event.target.value }))}
          >
            <option value="">Toutes</option>
            <option value="public">Public</option>
            <option value="private">Privé</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="loader" style={{ marginTop: 16 }}>
          Chargement…
        </div>
      ) : pages.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 16 }}>
          Aucune page créée pour le moment.
        </div>
      ) : (
        <table className="table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Slug</th>
              <th>Statut</th>
              <th>Visibilité</th>
              <th>Mise à jour</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const pageId = resolvePageId(page);
              return (
                <tr key={pageId}>
                  <td>{page.title || 'Sans titre'}</td>
                  <td>{page.slug || '—'}</td>
                  <td>
                    <select
                      value={page.status || 'draft'}
                      onChange={(event) => handleStatusChange(page, event.target.value)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{page.visibility || 'public'}</td>
                  <td>{formatDate(page.updatedAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link className="button secondary" to={`/pages/${pageId}/edit`}>
                        Éditer
                      </Link>
                      <button className="button danger" type="button" onClick={() => handleDelete(pageId)}>
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

      {error ? <div className="notice" style={{ marginTop: 16 }}>
        {error}
      </div> : null}
    </div>
  );
};
