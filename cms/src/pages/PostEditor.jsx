import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { uploadMedia } from '../services/media.service';
import { createPost, fetchPostById, updatePost, updatePostStatus } from '../services/posts.service';
import { useToast } from '../components/ToastProvider';
import { MediaPicker } from '../components/MediaPicker';
import { resolveMediaUrl } from '../lib/mediaUrls';
import { useRubrics } from '../hooks/useRubrics';
import { sanitizeHtml } from '../lib/sanitizeHtml';
import { AccessDenied } from '../components/AccessDenied';

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
  slug: '',
  content: '',
  category: 'TrustMedia',
  subCategory: TRUST_MEDIA_SUBCATEGORIES[0].value,
  status: 'draft',
  tags: '',
  image: '',
  imageOriginal: '',
  imageThumb: '',
  imageCover: '',
  imageMedium: '',
  imageThumbAvif: '',
  imageCoverAvif: '',
  imageMediumAvif: '',
  seoTitle: '',
  seoDescription: '',
  ogImage: '',
  featured: false,
  publishedAt: '',
  coverMediaId: '',
  featuredMediaId: '',
  featuredMediaUrl: '',
  mediaIds: [],
  eventDate: '',
  location: '',
  pricingType: 'free',
  price: '',
  registrationEnabled: false,
};

const resolveMediaCategory = (category) => {
  if (category === 'TrustEvent') return 'event';
  if (category === 'TrustProduction') return 'branding';
  return 'Media';
};

const resolveMediaMetadata = (category, subCategory) => {
  const mediaCategory = resolveMediaCategory(category);
  return {
    category: mediaCategory,
    subCategory: mediaCategory === 'Media' ? subCategory : undefined,
  };
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

export const PostEditor = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [pickerState, setPickerState] = useState({ open: false, mode: 'cover' });
  const [slugTouched, setSlugTouched] = useState(false);
  const quillRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const { rubrics: mediaRubrics } = useRubrics('TrustMedia');

  const isEditing = useMemo(() => Boolean(postId), [postId]);
  const rubricOptions = useMemo(() => {
    const options = mediaRubrics?.length
      ? mediaRubrics.map((rubric) => ({
          value: rubric.slug,
          label: rubric.label,
        }))
      : TRUST_MEDIA_SUBCATEGORIES;
    const current = formData.subCategory;
    if (current && !options.find((option) => option.value === current)) {
      options.unshift({ value: current, label: `Legacy: ${current}` });
    }
    return options;
  }, [formData.subCategory, mediaRubrics]);
  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: {
          image: () => imageInputRef.current?.click(),
          video: () => videoInputRef.current?.click(),
        },
      },
    }),
    []
  );
  const quillFormats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'code-block',
      'list',
      'bullet',
      'align',
      'link',
      'image',
      'video',
    ],
    []
  );

  useEffect(() => {
    if (!isEditing) return;
    const fetchPost = async () => {
      setFetching(true);
      setError(null);
      setErrorCode(null);
      try {
        const post = await fetchPostById(postId, { populateMedia: true });
        if (!post) throw new Error('Post introuvable');
        const featuredMedia = post.featuredMedia || post.featuredMediaId;
        const featuredMediaUrl =
          featuredMedia?.original?.url ||
          featuredMedia?.originalUrl ||
          featuredMedia?.url ||
          post.imageCover ||
          post.image ||
          '';
        const nextCategory = post.category || 'TrustMedia';
        const fallbackSubCategory =
          rubricOptions[0]?.value || TRUST_MEDIA_SUBCATEGORIES[0].value;
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          content: post.content || '',
          category: nextCategory,
          subCategory:
            nextCategory === 'TrustMedia'
              ? post.subCategory || fallbackSubCategory
              : post.subCategory || '',
          status: post.status || 'draft',
          tags: (post.tags || []).join(', '),
          image: post.image || '',
          imageOriginal: post.imageOriginal || '',
          imageThumb: post.imageThumb || '',
          imageCover: post.imageCover || '',
          imageMedium: post.imageMedium || '',
          imageThumbAvif: post.imageThumbAvif || '',
          imageCoverAvif: post.imageCoverAvif || '',
          imageMediumAvif: post.imageMediumAvif || '',
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          ogImage: post.ogImage || '',
          featured: Boolean(post.featured),
          publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : '',
          coverMediaId: post.coverMediaId || '',
          featuredMediaId: post.featuredMediaId || '',
          featuredMediaUrl,
          mediaIds: post.mediaIds || [],
          eventDate: post.eventDate ? post.eventDate.slice(0, 16) : '',
          location: post.location || '',
          pricingType: post.pricingType || 'free',
          price: post.price ?? '',
          registrationEnabled: Boolean(post.registrationEnabled),
        });
        setSlugTouched(Boolean(post.slug));
      } catch (err) {
        const statusCode = err.status || (err.message === 'Post introuvable' ? 404 : null);
        const message = statusCode === 404 ? 'Post introuvable' : err.message;
        setError(message);
        setErrorCode(statusCode);
        addToast(`Impossible de charger le post : ${err.message}`, { type: 'error' });
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [isEditing, postId, addToast, rubricOptions]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => {
      const nextValue = type === 'checkbox' ? checked : value;
      if (name === 'category') {
        return {
          ...prev,
          category: nextValue,
          subCategory: nextValue === 'TrustMedia' ? prev.subCategory || rubricOptions[0]?.value || '' : '',
        };
      }
      if (name === 'title' && !slugTouched) {
        return {
          ...prev,
          title: nextValue,
          slug: nextValue
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
        };
      }
      return {
        ...prev,
        [name]: nextValue,
      };
    });
  };

  const handleSlugChange = (event) => {
    const nextValue = event.target.value;
    setSlugTouched(true);
    setFormData((prev) => ({
      ...prev,
      slug: nextValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
    }));
  };

  const insertIntoContent = (snippet) => {
    setFormData((prev) => {
      const content = prev.content || '';
      const editor = quillRef.current?.getEditor();
      if (!editor) {
        return { ...prev, content: `${content}\n${snippet}` };
      }
      const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
      editor.clipboard.dangerouslyPasteHTML(range.index, snippet);
      return { ...prev, content: editor.root.innerHTML };
    });
  };

  const insertMediaEmbed = (media) => {
    if (!media?.url) return;
    const editor = quillRef.current?.getEditor();
    const url = resolveMediaUrl(media.original?.url || media.originalUrl || media.url);
    if (!editor) {
      insertIntoContent(buildMediaHtml(media));
      return;
    }
    const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
    if (media.type === 'image' || media.kind === 'image') {
      editor.insertEmbed(range.index, 'image', url, 'user');
    } else if (media.type === 'video' || media.kind === 'video') {
      editor.insertEmbed(range.index, 'video', url, 'user');
    } else {
      const label = media.name || url;
      editor.insertText(range.index, label, { link: url }, 'user');
    }
    editor.setSelection(range.index + 1, 0, 'user');
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadMedia(file, resolveMediaMetadata(formData.category, formData.subCategory));
      const originalUrl =
        data.originalUrl || data.media?.original?.url || data.media?.originalUrl || data.media?.url || data.url;
      setFormData((prev) => ({
        ...prev,
        image: originalUrl || prev.image,
        imageOriginal: originalUrl || prev.imageOriginal,
        imageThumb: data.thumbUrl || data.media?.variants?.thumb?.url || data.media?.thumbUrl || prev.imageThumb,
        imageCover: data.coverUrl || data.media?.variants?.cover?.url || data.media?.coverUrl || prev.imageCover,
        imageMedium: data.mediumUrl || data.media?.variants?.card?.url || data.media?.mediumUrl || prev.imageMedium,
        imageThumbAvif: data.thumbAvifUrl || data.media?.thumbAvifUrl || prev.imageThumbAvif,
        imageCoverAvif: data.coverAvifUrl || data.media?.coverAvifUrl || prev.imageCoverAvif,
        imageMediumAvif: data.mediumAvifUrl || data.media?.mediumAvifUrl || prev.imageMediumAvif,
        coverMediaId: data.media?._id || prev.coverMediaId,
        featuredMediaId: data.media?._id || prev.featuredMediaId,
        featuredMediaUrl: originalUrl || prev.featuredMediaUrl,
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
      const data = await uploadMedia(file, resolveMediaMetadata(formData.category, formData.subCategory));
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
      const originalUrl = media.original?.url || media.originalUrl || media.url;
      setFormData((prev) => ({
        ...prev,
        image: originalUrl || prev.image,
        imageOriginal: originalUrl || prev.imageOriginal,
        imageThumb: media.variants?.thumb?.url || media.thumbUrl || prev.imageThumb,
        imageCover: media.variants?.cover?.url || media.coverUrl || prev.imageCover,
        imageMedium: media.variants?.card?.url || media.mediumUrl || prev.imageMedium,
        imageThumbAvif: media.thumbAvifUrl || prev.imageThumbAvif,
        imageCoverAvif: media.coverAvifUrl || prev.imageCoverAvif,
        imageMediumAvif: media.mediumAvifUrl || prev.imageMediumAvif,
        coverMediaId: media._id,
        featuredMediaId: media._id,
        featuredMediaUrl: originalUrl || prev.featuredMediaUrl,
      }));
      return;
    }
    selected.forEach((media) => insertMediaEmbed(media));
    setFormData((prev) => ({
      ...prev,
      mediaIds: Array.from(new Set([...(prev.mediaIds || []), ...selected.map((media) => media._id)])),
    }));
  };

  const handleSubmit = async (event, { overrideStatus } = {}) => {
    event.preventDefault();
    if (!formData.title?.trim()) {
      setError('Le titre est obligatoire.');
      addToast('Le titre est obligatoire.', { type: 'error' });
      return;
    }
    if (!formData.category) {
      setError('La catégorie est obligatoire.');
      addToast('La catégorie est obligatoire.', { type: 'error' });
      return;
    }
    setLoading(true);
    setError(null);

    if (formData.category === 'TrustEvent') {
      if (!formData.eventDate) {
        setError('La date de l’événement est obligatoire.');
        addToast('La date de l’événement est obligatoire.', { type: 'error' });
        return;
      }
      if (!formData.location?.trim()) {
        setError('Le lieu est obligatoire pour un événement.');
        addToast('Le lieu est obligatoire pour un événement.', { type: 'error' });
        return;
      }
      if (formData.pricingType === 'paid' && !formData.price) {
        setError('Le prix est obligatoire pour un événement payant.');
        addToast('Le prix est obligatoire pour un événement payant.', { type: 'error' });
        return;
      }
    }

    const payload = {
      ...formData,
      slug: formData.slug || undefined,
      subCategory: formData.category === 'TrustMedia' ? formData.subCategory : '',
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: formData.publishedAt || undefined,
      content: sanitizeHtml(formData.content),
      mediaIds: formData.mediaIds,
      coverMediaId: formData.coverMediaId || undefined,
      featuredMediaId: formData.featuredMediaId || undefined,
      status: overrideStatus || formData.status,
      eventDate: formData.category === 'TrustEvent' ? formData.eventDate : undefined,
      location: formData.category === 'TrustEvent' ? formData.location : undefined,
      pricingType: formData.category === 'TrustEvent' ? formData.pricingType : undefined,
      price: formData.category === 'TrustEvent' ? formData.price : undefined,
      registrationEnabled: formData.category === 'TrustEvent' ? formData.registrationEnabled : undefined,
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

  const handleQuickStatusUpdate = async (nextStatus) => {
    if (!isEditing || !nextStatus) return;
    setStatusUpdating(true);
    try {
      await updatePostStatus(postId, nextStatus);
      setFormData((prev) => ({ ...prev, status: nextStatus }));
      addToast('Statut mis à jour.', { type: 'success' });
    } catch (err) {
      addToast(`Mise à jour impossible : ${err.message}`, { type: 'error' });
    } finally {
      setStatusUpdating(false);
    }
  };

  if (fetching) {
    return (
      <div className="section">
        <div className="section-header">
          <h2>{isEditing ? 'Éditer un post' : 'Créer un post'}</h2>
        </div>
        <div className="page-editor-layout">
          <div className="page-editor-main">
            <div className="page-card">
              <div className="skeleton-line skeleton-line--lg" />
              <div className="skeleton-line" />
              <div className="skeleton-block" />
            </div>
          </div>
          <div className="page-editor-sidebar">
            <div className="page-sidebar-stack">
              <div className="page-sidebar-card">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
              <div className="page-sidebar-card">
                <div className="skeleton-line" />
                <div className="skeleton-block skeleton-block--sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing && errorCode === 404) {
    return (
      <div className="section">
        <div className="section-header">
          <h2>Post introuvable</h2>
        </div>
        <div className="empty-state">
          <p>Ce post n’existe plus ou vous n’avez plus accès à son édition.</p>
          <button className="button secondary" type="button" onClick={() => navigate('/posts')}>
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (isEditing && errorCode === 403) {
    return <AccessDenied message="Vous n’avez pas accès à ce post." />;
  }

  const featuredPreview =
    formData.featuredMediaUrl ||
    formData.imageCover ||
    formData.imageMedium ||
    formData.image ||
    formData.imageOriginal;

  return (
    <div className="section">
      <div className="section-header">
        <h2>{isEditing ? 'Éditer un post' : 'Créer un post'}</h2>
      </div>

      {error ? <div className="notice">{error}</div> : null}

      <form onSubmit={handleSubmit}>
        <div className="page-editor-layout">
          <div className="page-editor-main page-editor-stack">
            <div className="page-card">
              <div className="page-card__header">
                <h3>Rédaction</h3>
                <span className="helper">Optimisé pour Trustplay CMS</span>
              </div>
              <div className="form-grid two-cols">
                <label>
                  Titre
                  <input name="title" value={formData.title} onChange={handleChange} required />
                </label>
                <label>
                  Slug
                  <input name="slug" value={formData.slug} onChange={handleSlugChange} placeholder="auto-genere" />
                </label>
              </div>
              <div className="form-field" style={{ marginTop: 16 }}>
                <span>Contenu</span>
                <div className="editor-toolbar">
                  <div className="editor-toolbar__actions">
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => setPickerState({ open: true, mode: 'inline' })}
                    >
                      Insérer depuis la médiathèque
                    </button>
                    <label className="button secondary" style={{ cursor: 'pointer' }}>
                      Upload & insérer
                      <input type="file" accept="image/*,video/*" onChange={handleInlineUpload} style={{ display: 'none' }} />
                    </label>
                    <span className="helper">{(formData.mediaIds || []).length} média(s) liés</span>
                  </div>
                </div>
                <div className="page-editor-quill">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="page-editor-sidebar">
            <div className="page-sidebar-stack">
              <div className="page-sidebar-card">
                <div className="page-sidebar-card__header">
                  <h3>Statut</h3>
                </div>
                <div className="form-grid">
                  <label>
                    Statut actuel
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </label>
                  <label>
                    Publication planifiée
                    <input
                      type="datetime-local"
                      name="publishedAt"
                      value={formData.publishedAt}
                      onChange={handleChange}
                    />
                  </label>
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                    Mettre en avant
                  </label>
                  {isEditing ? (
                    <div className="page-action-group">
                      <span className="helper">Mise à jour rapide</span>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => handleQuickStatusUpdate('draft')}
                          disabled={statusUpdating}
                        >
                          Passer en brouillon
                        </button>
                        <button
                          className="button"
                          type="button"
                          onClick={() => handleQuickStatusUpdate('published')}
                          disabled={statusUpdating}
                        >
                          Publier
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="page-sidebar-card">
                <div className="page-sidebar-card__header">
                  <h3>Actions</h3>
                </div>
                <div className="page-action-group">
                  <button className="button" type="submit" disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    className="button secondary"
                    type="button"
                    disabled={loading}
                    onClick={(event) => handleSubmit(event, { overrideStatus: 'draft' })}
                  >
                    Sauvegarder brouillon
                  </button>
                  <button
                    className="button secondary"
                    type="button"
                    disabled={loading}
                    onClick={(event) => handleSubmit(event, { overrideStatus: 'published' })}
                  >
                    Sauvegarder & publier
                  </button>
                  <button className="button secondary" type="button" onClick={() => navigate('/posts')}>
                    Annuler
                  </button>
                </div>
              </div>
              <div className="page-sidebar-card">
                <div className="page-sidebar-card__header">
                  <h3>Featured media</h3>
                </div>
                <div className="featured-media">
                  <div className="featured-media__preview">
                    {featuredPreview ? (
                      <img src={resolveMediaUrl(featuredPreview)} alt={formData.title || 'Featured media'} />
                    ) : (
                      <span>Aucun média sélectionné</span>
                    )}
                  </div>
                  <div className="featured-media__actions">
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => setPickerState({ open: true, mode: 'cover' })}
                    >
                      Choisir dans la médiathèque
                    </button>
                    <label className="button secondary" style={{ cursor: 'pointer' }}>
                      Upload nouveau
                      <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
                    </label>
                    {featuredPreview ? (
                      <button
                        className="button secondary"
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            featuredMediaId: '',
                            coverMediaId: '',
                            featuredMediaUrl: '',
                            image: '',
                            imageOriginal: '',
                            imageThumb: '',
                            imageCover: '',
                            imageMedium: '',
                          }))
                        }
                      >
                        Retirer
                      </button>
                    ) : null}
                  </div>
                  <label>
                    URL cover (legacy)
                    <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
                  </label>
                  {formData.featuredMediaId ? (
                    <span className="helper">Media ID: {formData.featuredMediaId}</span>
                  ) : null}
                </div>
              </div>
              <div className="page-sidebar-card">
                <div className="page-sidebar-card__header">
                  <h3>Catégorie</h3>
                </div>
                <div className="form-grid">
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
                        {rubricOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  <label>
                    Tags (séparés par des virgules)
                    <input name="tags" value={formData.tags} onChange={handleChange} />
                  </label>
                </div>
              </div>
              {formData.category === 'TrustEvent' ? (
                <div className="page-sidebar-card">
                  <div className="page-sidebar-card__header">
                    <h3>Détails événement</h3>
                  </div>
                  <div className="form-grid">
                    <label>
                      Date de l’événement
                      <input type="datetime-local" name="eventDate" value={formData.eventDate} onChange={handleChange} />
                    </label>
                    <label>
                      Lieu
                      <input name="location" value={formData.location} onChange={handleChange} />
                    </label>
                    <label>
                      Type de tarif
                      <select name="pricingType" value={formData.pricingType} onChange={handleChange}>
                        <option value="free">Gratuit</option>
                        <option value="paid">Payant</option>
                      </select>
                    </label>
                    {formData.pricingType === 'paid' ? (
                      <label>
                        Prix
                        <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" />
                      </label>
                    ) : null}
                    <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        name="registrationEnabled"
                        checked={formData.registrationEnabled}
                        onChange={handleChange}
                      />
                      Inscriptions activées
                    </label>
                  </div>
                </div>
              ) : null}
              <div className="page-sidebar-card">
                <div className="page-sidebar-card__header">
                  <h3>SEO</h3>
                </div>
                <div className="form-grid">
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleInlineUpload}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleInlineUpload}
        />
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
