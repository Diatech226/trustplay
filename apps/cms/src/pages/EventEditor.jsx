import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadMedia } from '../services/media.service';
import { createPost, fetchPostById, updatePost } from '../services/posts.service';
import { useToast } from '../components/ToastProvider';

const emptyForm = {
  title: '',
  content: '',
  status: 'draft',
  tags: '',
  image: '',
  eventDate: '',
  location: '',
  pricingType: 'free',
  price: '',
  publishedAt: '',
};

export const EventEditor = () => {
  const { id: postId } = useParams();
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
        const post = await fetchPostById(postId);
        if (!post) throw new Error('Événement introuvable');
        setFormData({
          title: post.title || '',
          content: post.content || '',
          status: post.status || 'draft',
          tags: (post.tags || []).join(', '),
          image: post.image || '',
          eventDate: post.eventDate ? post.eventDate.slice(0, 16) : '',
          location: post.location || '',
          pricingType: post.pricingType || 'free',
          price: post.price ?? '',
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
      const data = await uploadMedia(file, { category: 'event' });
      const url = data.media?.url || data.url;
      setFormData((prev) => ({ ...prev, image: url || prev.image }));
      addToast('Fichier uploadé avec succès.', { type: 'success' });
    } catch (err) {
      addToast(`Upload impossible : ${err.message}`, { type: 'error' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.eventDate) {
      setError("La date de l'événement est obligatoire.");
      setLoading(false);
      return;
    }
    if (!formData.location) {
      setError("Le lieu de l'événement est obligatoire.");
      setLoading(false);
      return;
    }
    if (!formData.pricingType) {
      setError('Le type de tarification est obligatoire.');
      setLoading(false);
      return;
    }
    if (formData.pricingType === 'paid' && !formData.price) {
      setError('Le prix est obligatoire pour un événement payant.');
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      category: 'TrustEvent',
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: formData.publishedAt || undefined,
      eventDate: formData.eventDate || undefined,
      price: formData.pricingType === 'paid' ? Number(formData.price) : undefined,
    };

    try {
      if (isEditing) {
        await updatePost(postId, payload);
        addToast('Événement mis à jour.', { type: 'success' });
      } else {
        await createPost(payload);
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
          <input
            type="datetime-local"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Lieu
          <input name="location" value={formData.location} onChange={handleChange} required />
        </label>
        <label>
          Tarification
          <select name="pricingType" value={formData.pricingType} onChange={handleChange} required>
            <option value="free">Gratuit</option>
            <option value="paid">Payant</option>
          </select>
        </label>
        {formData.pricingType === 'paid' ? (
          <label>
            Prix (€)
            <input name="price" value={formData.price} onChange={handleChange} type="number" min="0" />
          </label>
        ) : null}
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
