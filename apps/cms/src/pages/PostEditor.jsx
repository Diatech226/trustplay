import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { uploadMedia } from '../services/media.service';
import { createPost, fetchPostById, updatePost } from '../services/posts.service';
import { useToast } from '../components/ToastProvider';
import { MediaPicker } from '../components/MediaPicker';
import { resolveMediaUrl } from '../lib/mediaUrls';
import { useRubrics } from '../hooks/useRubrics';

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
  mediaIds: [],
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
  const url = resolveMediaUrl(media.originalUrl || media.url);
  if (media.kind === 'image') {
    return `<img src="${url}" alt="${media.name || ''}" />`;
  }
  if (media.kind === 'video') {
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
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [pickerState, setPickerState] = useState({ open: false, mode: 'cover' });
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
        const post = await fetchPostById(postId);
        if (!post) throw new Error('Post introuvable');
        const nextCategory = post.category || 'TrustMedia';
        const fallbackSubCategory =
          rubricOptions[0]?.value || TRUST_MEDIA_SUBCATEGORIES[0].value;
        setFormData({
          title: post.title || '',
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
          mediaIds: post.mediaIds || [],
        });
      } catch (err) {
        setError(err.message);
        setErrorCode(err.status || (err.message === 'Post introuvable' ? 404 : null));
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
      return {
        ...prev,
        [name]: nextValue,
      };
    });
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
    const url = resolveMediaUrl(media.originalUrl || media.url);
    if (!editor) {
      insertIntoContent(buildMediaHtml(media));
      return;
    }
    const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
    if (media.kind === 'image') {
      editor.insertEmbed(range.index, 'image', url, 'user');
    } else if (media.kind === 'video') {
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
      const originalUrl = data.originalUrl || data.media?.originalUrl || data.media?.url || data.url;
      setFormData((prev) => ({
        ...prev,
        image: originalUrl || prev.image,
        imageOriginal: originalUrl || prev.imageOriginal,
        imageThumb: data.thumbUrl || data.media?.thumbUrl || prev.imageThumb,
        imageCover: data.coverUrl || data.media?.coverUrl || prev.imageCover,
        imageMedium: data.mediumUrl || data.media?.mediumUrl || prev.imageMedium,
        imageThumbAvif: data.thumbAvifUrl || data.media?.thumbAvifUrl || prev.imageThumbAvif,
        imageCoverAvif: data.coverAvifUrl || data.media?.coverAvifUrl || prev.imageCoverAvif,
        imageMediumAvif: data.mediumAvifUrl || data.media?.mediumAvifUrl || prev.imageMediumAvif,
        coverMediaId: data.media?._id || prev.coverMediaId,
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
      const originalUrl = media.originalUrl || media.url;
      setFormData((prev) => ({
        ...prev,
        image: originalUrl || prev.image,
        imageOriginal: originalUrl || prev.imageOriginal,
        imageThumb: media.thumbUrl || prev.imageThumb,
        imageCover: media.coverUrl || prev.imageCover,
        imageMedium: media.mediumUrl || prev.imageMedium,
        imageThumbAvif: media.thumbAvifUrl || prev.imageThumbAvif,
        imageCoverAvif: media.coverAvifUrl || prev.imageCoverAvif,
        imageMediumAvif: media.mediumAvifUrl || prev.imageMediumAvif,
        coverMediaId: media._id,
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

  if (fetching) {
    return (
      <div className="section">
        <div className="section-header">
          <h2>{isEditing ? 'Éditer un post' : 'Créer un post'}</h2>
        </div>
        <div className="loader">Chargement du post…</div>
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
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={formData.content}
            onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
            modules={quillModules}
            formats={quillFormats}
          />
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
