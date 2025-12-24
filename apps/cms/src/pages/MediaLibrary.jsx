import { useCallback, useEffect, useState } from 'react';
import { formatDate } from '../lib/format';
import { useToast } from '../components/ToastProvider';
import { fetchUploads, uploadMedia } from '../services/media.service';

export const MediaLibrary = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const loadUploads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUploads({ limit: 50 });
      setUploads(response.uploads);
    } catch (err) {
      setError(err.message);
      addToast(`Impossible de récupérer la médiathèque : ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      await uploadMedia(file);
      await loadUploads();
      addToast('Upload réussi.', { type: 'success' });
    } catch (error) {
      addToast(`Upload impossible : ${error.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (url) => {
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error('Clipboard non disponible');
      }
      await navigator.clipboard.writeText(url);
      addToast('URL copiée.', { type: 'success' });
    } catch (error) {
      addToast(`Impossible de copier l'URL : ${error.message}`, { type: 'error' });
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
            Sélectionner un fichier
            <input type="file" onChange={handleUpload} />
          </label>
          {loading ? <div className="loader">Upload en cours…</div> : null}
          <p className="helper">Formats acceptés : images/vidéos via /api/uploads.</p>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Historique</h2>
          <button className="button secondary" type="button" onClick={loadUploads}>
            Rafraîchir
          </button>
        </div>
        {loading ? (
          <div className="loader">Chargement de la médiathèque…</div>
        ) : error ? (
          <div className="notice">{error}</div>
        ) : uploads.length === 0 ? (
          <div className="empty-state">Aucun média uploadé pour le moment.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Aperçu</th>
                <th>Nom</th>
                <th>Type</th>
                <th>Taille</th>
                <th>Ajouté le</th>
                <th>Lien</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={`${upload.url}-${upload.createdAt}`}>
                  <td>
                    {upload.type === 'image' ? (
                      <img
                        src={upload.url}
                        alt={upload.name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{upload.name}</td>
                  <td>{upload.mime || upload.type || '—'}</td>
                  <td>{upload.size ? `${Math.round(upload.size / 1024)} Ko` : '—'}</td>
                  <td>{formatDate(upload.createdAt)}</td>
                  <td>
                    <a href={upload.url} target="_blank" rel="noreferrer">
                      Ouvrir
                    </a>
                  </td>
                  <td>
                    <button className="button secondary" type="button" onClick={() => handleCopy(upload.url)}>
                      Copier URL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
