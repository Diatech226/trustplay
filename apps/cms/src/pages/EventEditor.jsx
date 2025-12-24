import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, uploadFile } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';

const emptyForm = {
  title: '',
  content: '',
  status: 'draft',
  tags: '',
  image: '',
  eventDate: '',
  location: '',
  publishedAt: '',
};

export const EventEditor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = useMemo(() => Boolean(postId), [postId]);

  useEffect(() => {
    if (!isEditing) return;
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/api/posts?postId=${postId}`);
        const post = response?.posts?.[0] || response?.data?.posts?.[0] || response?.post || response?.data?.post;
        if (!post) throw new Error('Événement introuvable');
        setFormData({
          title: post.title || '',
          content: post.content || '',
          status: post.status || 'draft',
          tags: (post.tags || []).join(', '),
          image: post.image || '',
          eventDate: post.eventDate ? post.eventDate.slice(0, 16) : '',
          location: post.location || '',
          publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : '',
        });
      } catch (err) {
        setError(err.message);
        addToast(`Impossible de charger l'événement : ${err.message}`, { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [isEditing, postId, addToast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadFile(file);
      setFormData((prev) => ({ ...prev, image: data.url || prev.image }));
      addToast('Fichier uploadé avec succès.', { type: 'success' });
    } catch (err) {
      addToast(`Upload impossible : ${err.message}`, { type: 'error' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      category: 'TrustEvent',
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: formData.publishedAt || undefined,
      eventDate: formData.eventDate || undefined,
    };

    try {
      if (isEditing) {
        await apiClient.put(`/api/posts/${postId}`, { body: payload });
        addToast('Événement mis à jour.', { type: 'success' });
      } else {
        await apiClient.post('/api/posts', { body: payload });
        addToast('Événement créé.', { type: 'success' });
      }
      navigate('/events', { replace: true, state: { refresh: Date.now() } });
    } catch (err) {
      setError(err.message);
      addToast(`Erreur : ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>{isEditing ? 'Éditer un événement' : 'Créer un événement'}</h2>
      </div>

      {error ? <div className="notice">{error}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Titre
          <input name="title" value={formData.title} onChange={handleChange} required />
        </label>
        <label>
          Description
          <textarea name="content" value={formData.content} onChange={handleChange} required />
        </label>
        <label>
          Date de l'événement
          <input type="datetime-local" name="eventDate" value={formData.eventDate} onChange={handleChange} />
        </label>
        <label>
          Lieu
          <input name="location" value={formData.location} onChange={handleChange} />
        </label>
        <label>
          Statut
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </label>
        <label>
          Tags (séparés par des virgules)
          <input name="tags" value={formData.tags} onChange={handleChange} />
        </label>
        <label>
          Image de couverture
          <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
        </label>
        <label>
          Upload média
          <input type="file" onChange={handleUpload} />
        </label>
        <label>
          Publication planifiée
          <input type="datetime-local" name="publishedAt" value={formData.publishedAt} onChange={handleChange} />
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button className="button secondary" type="button" onClick={() => navigate('/events')}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};
