import { useState } from 'react';
import { uploadFile } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';

export const MediaLibrary = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const data = await uploadFile(file);
      const entry = {
        name: data.name || file.name,
        url: data.url,
        mime: data.mime || file.type,
        createdAt: new Date().toISOString(),
      };
      setUploads((prev) => [entry, ...prev]);
      addToast('Upload réussi.', { type: 'success' });
    } catch (error) {
      addToast(`Upload impossible : ${error.message}`, { type: 'error' });
    } finally {
      setLoading(false);
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
        </div>
        {uploads.length === 0 ? (
          <div className="empty-state">Aucun média uploadé pour le moment.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Lien</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={`${upload.url}-${upload.createdAt}`}>
                  <td>{upload.name}</td>
                  <td>{upload.mime || '—'}</td>
                  <td>
                    <a href={upload.url} target="_blank" rel="noreferrer">
                      Ouvrir
                    </a>
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
