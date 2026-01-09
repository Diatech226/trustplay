import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadMedia } from '../services/media.service';
import { createPost, fetchPostById, updatePost } from '../services/posts.service';
import { useToast } from '../components/ToastProvider';
import { useRubrics } from '../hooks/useRubrics';
import { MediaPicker } from '../components/MediaPicker';
import { resolveMediaUrl } from '../lib/mediaUrls';

const emptyForm = {
  title: '',
  content: '',
  subCategory: '',
  status: 'draft',
  tags: '',
  image: '',
  imageOriginal: '',
  imageThumb: '',
  imageCover: '',
  imageMedium: '',
  coverMediaId: '',
  featuredMediaId: '',
  mediaIds: [],
  eventDate: '',
  location: '',
  pricingType: 'free',
  price: '',
  publishedAt: '',
};

const buildMediaHtml = (media) => {
  const url = resolveMediaUrl(media.original?.url || media.originalUrl || media.url);
  if (media.type === 'image' || media.kind === 'image') {
    return `<img src="${url}" alt="${media.alt || media.name || ''}" />`;
  }
  if (media.type === 'video' || media.kind === 'video') {
    return `<video src="${url}" controls></video>`;
  }
  return `<a href="${url}" target="_blank" rel="noreferrer">${media.name || url}</a>`;
};

export const EventEditor = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { rubrics: eventRubrics } = useRubrics('TrustEvent');
  const [pickerState, setPickerState] = useState({ open: false, mode: 'cover' });
  const contentRef = useRef(null);

  const isEditing = useMemo(() => Boolean(postId), [postId]);
  const eventRubricOptions = useMemo(() => {
    const options = eventRubrics?.length
      ? eventRubrics.map((rubric) => ({ value: rubric.slug, label: rubric.label }))
      : [];
    const current = formData.subCategory;
    if (current && !options.find((option) => option.value === current)) {
      options.unshift({ value: current, label: `Legacy: ${current}` });
    }
    return options;
  }, [eventRubrics, formData.subCategory]);

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
          subCategory: post.subCategory || eventRubrics?.[0]?.slug || '',
          status: post.status || 'draft',
          tags: (post.tags || []).join(', '),
          image: post.image || '',
          imageOriginal: post.imageOriginal || '',
          imageThumb: post.imageThumb || '',
          imageCover: post.imageCover || '',
          imageMedium: post.imageMedium || '',
          coverMediaId: post.coverMediaId || '',
          featuredMediaId: post.featuredMediaId || '',
          mediaIds: post.mediaIds || [],
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
  }, [isEditing, postId, addToast, eventRubrics]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const insertIntoContent = (snippet) => {
    setFormData((prev) => {
      const content = prev.content || '';
      const textarea = contentRef.current;
      if (textarea && typeof textarea.selectionStart === 'number') {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const nextValue = `${content.slice(0, start)}${snippet}${content.slice(end)}`;
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
        });
        return { ...prev, content: nextValue };
      }
      return { ...prev, content: `${content}\n${snippet}` };
    });
  };

  const insertMediaEmbed = (media) => {
    if (!media) return;
    insertIntoContent(buildMediaHtml(media));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadMedia(file, {
        category: 'Media',
        subCategory: formData.subCategory || undefined,
      });
      const url = data.originalUrl || data.media?.originalUrl || data.media?.url || data.url;
      setFormData((prev) => ({
        ...prev,
        image: url || prev.image,
        imageOriginal: data.originalUrl || data.media?.originalUrl || prev.imageOriginal,
        imageThumb: data.thumbUrl || data.media?.thumbUrl || prev.imageThumb,
        imageCover: data.coverUrl || data.media?.coverUrl || prev.imageCover,
        imageMedium: data.mediumUrl || data.media?.mediumUrl || prev.imageMedium,
        coverMediaId: data.media?._id || prev.coverMediaId,
        featuredMediaId: data.media?._id || prev.featuredMediaId,
      }));
      addToast('Fichier uploadé avec succès.', { type: 'success' });
    } catch (err) {
      addToast(`Upload impossible : ${err.message}`, { type: 'error' });
    } finally {
      event.target.value = '';
    }
  };

  const handleInlineUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadMedia(file, {
        category: 'Media',
        subCategory: formData.subCategory || undefined,
      });
      const media = data.media;
      if (media) {
        insertMediaEmbed(media);
        setFormData((prev) => ({
          ...prev,
          mediaIds: Array.from(new Set([...(prev.mediaIds || []), media._id])),
        }));
      }
      addToast('Média inséré dans le contenu.', { type: 'success' });
    } catch (err) {
      addToast(`Upload impossible : ${err.message}`, { type: 'error' });
    } finally {
      event.target.value = '';
    }
  };

  const handlePickerSelect = (selected) => {
    if (pickerState.mode === 'cover') {
      const media = selected[0];
      if (!media) return;
      const originalUrl = media.original?.url || media.originalUrl || media.url;
      setFormData((prev) => ({
        ...prev,
        image: originalUrl || prev.image,
        imageOriginal: originalUrl || prev.imageOriginal,
        imageThumb: media.variants?.thumb?.url || media.thumbUrl || prev.imageThumb,
        imageCover: media.variants?.cover?.url || media.coverUrl || prev.imageCover,
        imageMedium: media.variants?.card?.url || media.mediumUrl || prev.imageMedium,
        coverMediaId: media._id,
        featuredMediaId: media._id,
      }));
      return;
    }
    selected.forEach((media) => insertMediaEmbed(media));
    setFormData((prev) => ({
      ...prev,
      mediaIds: Array.from(new Set([...(prev.mediaIds || []), ...selected.map((media) => media._id)])),
    }));
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
      subCategory: formData.subCategory || undefined,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: formData.publishedAt || undefined,
      eventDate: formData.eventDate || undefined,
      price: formData.pricingType === 'paid' ? Number(formData.price) : undefined,
      coverMediaId: formData.coverMediaId || undefined,
      featuredMediaId: formData.featuredMediaId || undefined,
      mediaIds: formData.mediaIds,
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
          <textarea
            ref={contentRef}
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className="button secondary"
              type="button"
              onClick={() => setPickerState({ open: true, mode: 'inline' })}
            >
              Insérer un média
            </button>
            <label className="button secondary" style={{ cursor: 'pointer' }}>
              Upload dans le contenu
              <input type="file" onChange={handleInlineUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </label>
        <label>
          Rubrique
          <select name="subCategory" value={formData.subCategory} onChange={handleChange} required>
            <option value="">Choisir une rubrique</option>
            {eventRubricOptions.map((rubric) => (
              <option key={rubric.value} value={rubric.value}>
                {rubric.label}
              </option>
            ))}
          </select>
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
          Featured media
          <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
          <span className="helper">Sélectionnez un média ou collez une URL (legacy).</span>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className="button secondary"
              type="button"
              onClick={() => setPickerState({ open: true, mode: 'cover' })}
            >
              Bibliothèque médias
            </button>
            <label className="button secondary" style={{ cursor: 'pointer' }}>
              Upload cover
              <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
            </label>
          </div>
          {formData.featuredMediaId ? (
            <span className="helper">Featured media ID: {formData.featuredMediaId}</span>
          ) : null}
          {formData.image ? (
            <img
              src={resolveMediaUrl(formData.image)}
              alt={formData.title || 'Featured media'}
              style={{ marginTop: 12, maxWidth: 240, borderRadius: 8 }}
            />
          ) : null}
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
      <MediaPicker
        open={pickerState.open}
        multiple={pickerState.mode === 'inline'}
        title={pickerState.mode === 'inline' ? 'Sélectionner des médias' : 'Sélectionner un cover'}
        onClose={() => setPickerState((prev) => ({ ...prev, open: false }))}
        onSelect={handlePickerSelect}
      />
    </div>
  );
};
