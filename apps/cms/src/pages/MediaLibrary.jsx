import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatDate } from '../lib/format';
import { useToast } from '../components/ToastProvider';
import { deleteMedia, fetchMedia, updateMedia, uploadMedia } from '../services/media.service';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl } from '../lib/mediaUrls';

const CATEGORY_OPTIONS = [
  { value: 'article', label: 'Article' },
  { value: 'event', label: 'Event' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'branding', label: 'Branding' },
];

const KIND_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Vidéo' },
  { value: 'file', label: 'Fichier' },
];

const formatSize = (size) => {
  if (!size) return '—';
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} Mo`;
  return `${Math.round(size / 1024)} Ko`;
};

export const MediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', kind: '' });
  const [pagination, setPagination] = useState({ startIndex: 0, limit: 20, total: 0 });
  const [uploadCategory, setUploadCategory] = useState('gallery');
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const isAdmin = Boolean(currentUser?.isAdmin);

  const MediaPreview = ({ item }) => {
    const [failed, setFailed] = useState(false);
    const previewUrl = resolveMediaUrl(item.url);
    if (!previewUrl || failed) {
      return <div className="empty-state">Prévisualisation indisponible</div>;
    }
    if (item.kind === 'image') {
      return (
        <img
          src={previewUrl}
          alt={item.name}
          onError={() => setFailed(true)}
          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
        />
      );
    }
    if (item.kind === 'video') {
      return <video src={previewUrl} style={{ width: 72, height: 48 }} onError={() => setFailed(true)} />;
    }
    return <span className="helper">Fichier</span>;
  };

  const loadMedia = useCallback(
    async ({ reset = false } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const startIndex = reset ? 0 : pagination.startIndex;
        const response = await fetchMedia({
          search: filters.search,
          category: filters.category,
          kind: filters.kind,
          startIndex,
          limit: pagination.limit,
          order: 'desc',
        });
        setMediaItems((prev) => (reset ? response.media : [...prev, ...response.media]));
        setPagination((prev) => ({
          ...prev,
          startIndex: startIndex + response.media.length,
          total: response.totalMedia,
        }));
      } catch (err) {
        setError(err.message);
        addToast(`Impossible de récupérer la médiathèque : ${err.message}`, { type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [addToast, filters, pagination.limit, pagination.startIndex]
  );

  useEffect(() => {
    loadMedia({ reset: true });
  }, [loadMedia, filters]);

  const canLoadMore = useMemo(() => mediaItems.length < pagination.total, [mediaItems.length, pagination.total]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      await uploadMedia(file, { category: uploadCategory });
      await loadMedia({ reset: true });
      addToast('Upload réussi.', { type: 'success' });
    } catch (error) {
      addToast(`Upload impossible : ${error.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (url) => {
    try {
      const previewUrl = resolveMediaUrl(url);
      if (!navigator?.clipboard?.writeText) {
        throw new Error('Clipboard non disponible');
      }
      await navigator.clipboard.writeText(previewUrl);
      addToast('URL copiée.', { type: 'success' });
    } catch (error) {
      addToast(`Impossible de copier l'URL : ${error.message}`, { type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await deleteMedia(id);
      setMediaItems((prev) => prev.filter((item) => item._id !== id));
      setPagination((prev) => ({ ...prev, total: Math.max(prev.total - 1, 0) }));
      addToast('Média supprimé.', { type: 'success' });
    } catch (error) {
      addToast(`Suppression impossible : ${error.message}`, { type: 'error' });
    }
  };

  const handleRename = async (media) => {
    const name = window.prompt('Nouveau nom du média', media.name);
    if (!name || name === media.name) return;
    try {
      const response = await updateMedia(media._id, { name });
      const updated = response?.media || response?.data?.media;
      setMediaItems((prev) => prev.map((item) => (item._id === media._id ? updated : item)));
      addToast('Nom mis à jour.', { type: 'success' });
    } catch (error) {
      addToast(`Mise à jour impossible : ${error.message}`, { type: 'error' });
    }
  };

  const handleUpdateCategory = async (media) => {
    const category = window.prompt('Nouvelle catégorie', media.category);
    if (!category || category === media.category) return;
    try {
      const response = await updateMedia(media._id, { category });
      const updated = response?.media || response?.data?.media;
      setMediaItems((prev) => prev.map((item) => (item._id === media._id ? updated : item)));
      addToast('Catégorie mise à jour.', { type: 'success' });
    } catch (error) {
      addToast(`Mise à jour impossible : ${error.message}`, { type: 'error' });
    }
  };

  return (
    <div>
      <div className="section">
        <div className="section-header">
          <h2>Uploader un média</h2>
        </div>
        <div className="form-grid">
          <label>
            Catégorie
            <select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value)}>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sélectionner un fichier
            <input type="file" onChange={handleUpload} />
          </label>
          {loading ? <div className="loader">Upload en cours…</div> : null}
          <p className="helper">Formats acceptés : images/vidéos via /api/uploads.</p>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Media Library</h2>
          <button className="button secondary" type="button" onClick={() => loadMedia({ reset: true })}>
            Rafraîchir
          </button>
        </div>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <label>
            Recherche
            <input
              placeholder="Nom, tag, URL"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            />
          </label>
          <label>
            Catégorie
            <input
              placeholder="article, event..."
              value={filters.category}
              onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
            />
          </label>
          <label>
            Type
            <select value={filters.kind} onChange={(event) => setFilters((prev) => ({ ...prev, kind: event.target.value }))}>
              {KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && mediaItems.length === 0 ? (
          <div className="loader">Chargement de la médiathèque…</div>
        ) : error ? (
          <div className="notice">{error}</div>
        ) : mediaItems.length === 0 ? (
          <div className="empty-state">Aucun média uploadé pour le moment.</div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Aperçu</th>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Type</th>
                  <th>Taille</th>
                  <th>Ajouté le</th>
                  <th>Lien</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mediaItems.map((item) => {
                  const previewUrl = resolveMediaUrl(item.url);
                  return (
                  <tr key={item._id}>
                    <td>
                      <MediaPreview item={item} />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.mimeType || item.kind}</td>
                    <td>{formatSize(item.size)}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      {previewUrl ? (
                        <a href={previewUrl} target="_blank" rel="noreferrer">
                          Ouvrir
                        </a>
                      ) : (
                        <span className="helper">Lien indisponible</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => handleCopy(item.url)}
                          disabled={!previewUrl}
                        >
                          Copier URL
                        </button>
                        <button className="button secondary" type="button" onClick={() => handleRename(item)}>
                          Renommer
                        </button>
                        <button className="button secondary" type="button" onClick={() => handleUpdateCategory(item)}>
                          Catégorie
                        </button>
                        {isAdmin ? (
                          <button className="button danger" type="button" onClick={() => handleDelete(item._id)}>
                            Supprimer
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="helper">
                {mediaItems.length} / {pagination.total} médias
              </span>
              {canLoadMore ? (
                <button className="button secondary" type="button" onClick={() => loadMedia()} disabled={loading}>
                  Charger plus
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
