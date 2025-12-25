import { useEffect, useMemo, useState } from 'react';
import { fetchMedia } from '../services/media.service';
import { useToast } from './ToastProvider';
import { resolveMediaUrl } from '../lib/mediaUrls';

const KIND_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Vidéo' },
  { value: 'file', label: 'Fichier' },
];

export const MediaPicker = ({ open, onClose, onSelect, multiple = false, title = 'Bibliothèque médias' }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', subCategory: '', kind: '' });
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const { addToast } = useToast();

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchMedia({
          search: filters.search,
          category: filters.category,
          subCategory: filters.subCategory,
          kind: filters.kind,
          startIndex: 0,
          limit: 40,
          order: 'desc',
        });
        setMediaItems(response.media);
      } catch (error) {
        addToast(`Impossible de charger la médiathèque : ${error.message}`, { type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast, filters, open]);

  const selectedItems = useMemo(
    () => mediaItems.filter((item) => selectedIds.has(item._id)),
    [mediaItems, selectedIds]
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedItems.length === 0) {
      addToast('Sélectionnez au moins un média.', { type: 'error' });
      return;
    }
    onSelect(selectedItems);
    onClose();
    setSelectedIds(new Set());
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal modal-large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{title}</h3>
          <button className="button secondary" type="button" onClick={onClose}>
            Fermer
          </button>
        </div>
        <div className="form-grid" style={{ marginTop: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <label>
            Recherche
            <input
              placeholder="Nom, URL, tags"
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
        </div>
        {loading ? (
          <div className="loader" style={{ marginTop: 16 }}>
            Chargement…
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 16 }}>
            Aucun média disponible.
          </div>
        ) : (
          <div className="media-grid" style={{ marginTop: 16 }}>
            {mediaItems.map((item) => {
              const previewUrl = resolveMediaUrl(item.url);
              return (
                <button
                  type="button"
                  key={item._id}
                  className={`media-card${selectedIds.has(item._id) ? ' selected' : ''}`}
                  onClick={() => toggleSelect(item._id)}
                >
                  {previewUrl ? (
                    item.kind === 'image' ? (
                      <img src={previewUrl} alt={item.name} />
                    ) : item.kind === 'video' ? (
                      <video src={previewUrl} />
                    ) : (
                      <div className="media-file">{item.name}</div>
                    )
                  ) : (
                    <div className="media-file">Preview indisponible</div>
                  )}
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
          <button className="button secondary" type="button" onClick={onClose}>
            Annuler
          </button>
          <button className="button" type="button" onClick={handleConfirm}>
            Sélectionner
          </button>
        </div>
      </div>
    </div>
  );
};
