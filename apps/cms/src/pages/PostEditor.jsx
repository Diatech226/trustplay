import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadMedia } from '../services/media.service';
import { createPost, fetchPostById, updatePost } from '../services/posts.service';
import { useToast } from '../components/ToastProvider';
import { MediaPicker } from '../components/MediaPicker';

const CATEGORY_OPTIONS = [
  { value: 'TrustMedia', label: 'Trust Media' },
  { value: 'TrustEvent', label: 'Trust Event' },
  { value: 'TrustProduction', label: 'Trust Production' },
];

const TRUST_MEDIA_SUBCATEGORIES = [
  { value: 'news', label: 'News' },
  { value: 'politique', label: 'Politique' },
  { value: 'science-tech', label: 'Science & Tech' },
  { value: 'sport', label: 'Sport' },
  { value: 'cinema', label: 'Cinéma' },
];

const emptyForm = {
  title: '',
  content: '',
  category: 'TrustMedia',
  subCategory: TRUST_MEDIA_SUBCATEGORIES[0].value,
  status: 'draft',
  tags: '',
  image: '',
  seoTitle: '',
  seoDescription: '',
  ogImage: '',
  featured: false,
  publishedAt: '',
  coverMediaId: '',
  mediaIds: [],
};

const resolveMediaCategory = (category) => {
  if (category === 'TrustEvent') return 'event';
  if (category === 'TrustProduction') return 'branding';
  return 'article';
};

const buildMediaHtml = (media) => {
  if (media.kind === 'image') {
    return `<img src="${media.url}" alt="${media.name || ''}" />`;
  }
  if (media.kind === 'video') {
    return `<video src="${media.url}" controls></video>`;
  }
  return `<a href="${media.url}" target="_blank" rel="noreferrer">${media.name || media.url}</a>`;
};

export const PostEditor = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pickerState, setPickerState] = useState({ open: false, mode: 'cover' });
  const contentRef = useRef(null);

  const isEditing = useMemo(() => Boolean(postId), [postId]);

  useEffect(() => {
    if (!isEditing) return;
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const post = await fetchPostById(postId);
        if (!post) throw new Error('Post introuvable');
        const nextCategory = post.category || 'TrustMedia';
        setFormData({
          title: post.title || '',
          content: post.content || '',
          category: nextCategory,
          subCategory:
            nextCategory === 'TrustMedia'
              ? post.subCategory || TRUST_MEDIA_SUBCATEGORIES[0].value
              : post.subCategory || '',
          status: post.status || 'draft',
          tags: (post.tags || []).join(', '),
          image: post.image || '',
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          ogImage: post.ogImage || '',
          featured: Boolean(post.featured),
          publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : '',
          coverMediaId: post.coverMediaId || '',
          mediaIds: post.mediaIds || [],
        });
      } catch (err) {
        setError(err.message);
        addToast(`Impossible de charger le post : ${err.message}`, { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [isEditing, postId, addToast]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => {
      const nextValue = type === 'checkbox' ? checked : value;
      if (name === 'category') {
        return {
          ...prev,
          category: nextValue,
          subCategory: nextValue === 'TrustMedia' ? prev.subCategory || TRUST_MEDIA_SUBCATEGORIES[0].value : '',
        };
      }
      return {
        ...prev,
        [name]: nextValue,
      };
    });
  };

  const insertIntoContent = (snippet) => {
    setFormData((prev) => {
      const content = prev.content || '';
      const textarea = contentRef.current;
      if (!textarea) {
        return { ...prev, content: `${content}\n${snippet}` };
      }
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const nextContent = `${content.slice(0, start)}${snippet}${content.slice(end)}`;
      return { ...prev, content: nextContent };
    });
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadMedia(file, { category: resolveMediaCategory(formData.category) });
      const url = data.media?.url || data.url;
      setFormData((prev) => ({
        ...prev,
        image: url || prev.image,
        coverMediaId: data.media?._id || prev.coverMediaId,
      }));
      addToast('Fichier uploadé avec succès.', { type: 'success' });
    } catch (err) {
      addToast(`Upload impossible : ${err.message}`, { type: 'error' });
    }
  };

  const handleInlineUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadMedia(file, { category: resolveMediaCategory(formData.category) });
      const media = data.media;
      if (media) {
        insertIntoContent(buildMediaHtml(media));
        setFormData((prev) => ({
          ...prev,
          mediaIds: Array.from(new Set([...(prev.mediaIds || []), media._id])),
        }));
      }
      addToast('Média inséré dans le contenu.', { type: 'success' });
    } catch (err) {
      addToast(`Upload impossible : ${err.message}`, { type: 'error' });
    }
  };

  const handlePickerSelect = (selected) => {
    if (pickerState.mode === 'cover') {
      const media = selected[0];
      setFormData((prev) => ({
        ...prev,
        image: media.url || prev.image,
        coverMediaId: media._id,
      }));
      return;
    }

    const snippets = selected.map((media) => buildMediaHtml(media)).join('\n');
    insertIntoContent(snippets);
    setFormData((prev) => ({
      ...prev,
      mediaIds: Array.from(new Set([...(prev.mediaIds || []), ...selected.map((media) => media._id)])),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      subCategory: formData.category === 'TrustMedia' ? formData.subCategory : '',
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: formData.publishedAt || undefined,
      mediaIds: formData.mediaIds,
      coverMediaId: formData.coverMediaId || undefined,
    };

    try {
      if (isEditing) {
        await updatePost(postId, payload);
        addToast('Post mis à jour.', { type: 'success' });
      } else {
        await createPost(payload);
        addToast('Post créé.', { type: 'success' });
      }
      navigate('/posts', { replace: true, state: { refresh: Date.now() } });
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
        <h2>{isEditing ? 'Éditer un post' : 'Créer un post'}</h2>
      </div>

      {error ? <div className="notice">{error}</div> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Titre
          <input name="title" value={formData.title} onChange={handleChange} required />
        </label>
        <label>
          Contenu
          <textarea ref={contentRef} name="content" value={formData.content} onChange={handleChange} required />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button
              className="button secondary"
              type="button"
              onClick={() => setPickerState({ open: true, mode: 'inline' })}
            >
              Bibliothèque médias
            </button>
            <label className="button secondary" style={{ cursor: 'pointer' }}>
              Upload & insérer
              <input type="file" onChange={handleInlineUpload} style={{ display: 'none' }} />
            </label>
            <span className="helper">{(formData.mediaIds || []).length} média(s) liés</span>
          </div>
        </label>
        <label>
          Catégorie
          <select name="category" value={formData.category} onChange={handleChange} required>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {formData.category === 'TrustMedia' ? (
          <label>
            Sous-catégorie
            <select name="subCategory" value={formData.subCategory} onChange={handleChange} required>
              {TRUST_MEDIA_SUBCATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
          <span className="helper">Vous pouvez coller une URL ou sélectionner un média.</span>
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
          {formData.coverMediaId ? <span className="helper">Cover media ID: {formData.coverMediaId}</span> : null}
        </label>
        <label>
          SEO Title
          <input name="seoTitle" value={formData.seoTitle} onChange={handleChange} />
        </label>
        <label>
          SEO Description
          <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} />
        </label>
        <label>
          OG Image
          <input name="ogImage" value={formData.ogImage} onChange={handleChange} placeholder="https://..." />
        </label>
        <label>
          Publication planifiée
          <input type="datetime-local" name="publishedAt" value={formData.publishedAt} onChange={handleChange} />
        </label>
        <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
          Mettre en avant
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button className="button secondary" type="button" onClick={() => navigate('/posts')}>
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
