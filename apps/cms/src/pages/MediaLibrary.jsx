import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatDate } from '../lib/format';
import { useToast } from '../components/ToastProvider';
import { deleteMedia, fetchMedia, updateMedia, uploadMedia } from '../services/media.service';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl } from '../lib/mediaUrls';
import { resolveMediaUrlFromAsset } from '../utils/media';
import { useRubrics } from '../hooks/useRubrics';

const CATEGORY_OPTIONS = [
  { value: 'Media', label: 'Media (rubriques)' },
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
  const [filters, setFilters] = useState({ search: '', category: '', subCategory: '', kind: '', status: '' });
  const [pagination, setPagination] = useState({ startIndex: 0, limit: 20, total: 0 });
  const [uploadCategory, setUploadCategory] = useState('Media');
  const [uploadSubCategory, setUploadSubCategory] = useState('');
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.isAdmin === true;
  const { rubrics: mediaRubrics } = useRubrics('Media');
  const [editingMedia, setEditingMedia] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    alt: '',
    caption: '',
    credit: '',
    category: '',
    tags: '',
    status: 'published',
  });

  const MediaPreview = ({ item }) => {
    const [failed, setFailed] = useState(false);
    const previewUrl = resolveMediaUrlFromAsset(item, 'thumb');
    if (!previewUrl || failed) {
      return <div className="empty-state">Prévisualisation indisponible</div>;
    }
    if (item.type === 'image' || item.kind === 'image') {
      return (
        <img
          src={previewUrl}
          alt={item.alt || item.title || item.name}
          onError={() => setFailed(true)}
          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
        />
      );
    }
    if (item.type === 'video' || item.kind === 'video') {
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
          subCategory: filters.subCategory,
          kind: filters.kind,
          status: filters.status,
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
      await uploadMedia(file, {
        category: uploadCategory,
        subCategory: uploadCategory === 'Media' ? uploadSubCategory : undefined,
      });
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

  const openEditModal = (media) => {
    setEditingMedia(media);
    setEditForm({
      title: media.title || media.name || '',
      alt: media.alt || media.altText || '',
      caption: media.caption || '',
      credit: media.credit || '',
      category: media.category || '',
      tags: (media.tags || []).join(', '),
      status: media.status || 'published',
    });
  };

  const handleUpdateMedia = async (event) => {
    event.preventDefault();
    if (!editingMedia) return;
    try {
      const response = await updateMedia(editingMedia._id, {
        title: editForm.title,
        alt: editForm.alt,
        caption: editForm.caption,
        credit: editForm.credit,
        category: editForm.category,
        tags: editForm.tags,
        status: editForm.status,
      });
      const updated = response?.media || response?.data?.media;
      setMediaItems((prev) => prev.map((item) => (item._id === editingMedia._id ? updated : item)));
      setEditingMedia(null);
      addToast('Média mis à jour.', { type: 'success' });
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
          {uploadCategory === 'Media' ? (
            <label>
              Sous-catégorie
              <select
                value={uploadSubCategory}
                onChange={(event) => setUploadSubCategory(event.target.value)}
                required
              >
                <option value="">Choisir une rubrique</option>
                {mediaRubrics.map((rubric) => (
                  <option key={rubric.slug} value={rubric.slug}>
                    {rubric.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            Sélectionner un fichier
            <input type="file" onChange={handleUpload} />
          </label>
          {loading ? <div className="loader">Upload en cours…</div> : null}
          <p className="helper">Formats acceptés : images/vidéos via /api/media/upload.</p>
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
            Sous-catégorie
            <input
              placeholder="news, conférence..."
              value={filters.subCategory}
              onChange={(event) => setFilters((prev) => ({ ...prev, subCategory: event.target.value }))}
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
          <label>
            Statut
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="">Tous</option>
              <option value="draft">Draft</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
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
                  <th>Sous-catégorie</th>
                  <th>Type</th>
                  <th>Taille</th>
                  <th>Ajouté le</th>
                  <th>Lien</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mediaItems.map((item) => {
                  const previewUrl = resolveMediaUrlFromAsset(item, 'thumb');
                  return (
                  <tr key={item._id}>
                    <td>
                      <MediaPreview item={item} />
                    </td>
                    <td>{item.title || item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.subCategory || '—'}</td>
                    <td>{item.type || item.kind || item.mimeType}</td>
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
                        <button className="button secondary" type="button" onClick={() => openEditModal(item)}>
                          Éditer
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
      {editingMedia ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Éditer le média</h3>
              <button className="button secondary" type="button" onClick={() => setEditingMedia(null)}>
                Fermer
              </button>
            </div>
            <form className="form-grid" onSubmit={handleUpdateMedia} style={{ marginTop: 12 }}>
              <label>
                Titre
                <input
                  value={editForm.title}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>
              <label>
                Texte alternatif (obligatoire)
                <input
                  value={editForm.alt}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, alt: event.target.value }))}
                  required
                />
              </label>
              <label>
                Légende
                <textarea
                  value={editForm.caption}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, caption: event.target.value }))}
                />
              </label>
              <label>
                Crédit
                <input
                  value={editForm.credit}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, credit: event.target.value }))}
                />
              </label>
              <label>
                Catégorie
                <input
                  value={editForm.category}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
                  required
                />
              </label>
              <label>
                Tags
                <input
                  value={editForm.tags}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="news, politics"
                />
              </label>
              <label>
                Statut
                <select
                  value={editForm.status}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="button secondary" type="button" onClick={() => setEditingMedia(null)}>
                  Annuler
                </button>
                <button className="button" type="submit">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
