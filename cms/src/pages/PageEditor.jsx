import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createPage, fetchPageById, updatePage } from '../services/pages.service';
import { useToast } from '../components/ToastProvider';
import { MediaPicker } from '../components/MediaPicker';
import { resolveMediaUrl } from '../lib/mediaUrls';
import { sanitizeHtml } from '../lib/sanitizeHtml';
import { AccessDenied } from '../components/AccessDenied';
import { uploadMedia } from '../services/media.service';
import { PageEditorLayout } from '../components/pageEditor/PageEditorLayout';
import { PageMetaSidebar } from '../components/pageEditor/PageMetaSidebar';
import { StatusSelect } from '../components/pageEditor/StatusSelect';
import { SlugInput } from '../components/pageEditor/SlugInput';
import { SeoFields } from '../components/pageEditor/SeoFields';
import { FeaturedMediaField } from '../components/pageEditor/FeaturedMediaField';
import { EditorToolbar } from '../components/pageEditor/EditorToolbar';

const emptyForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  status: 'draft',
  publishedAt: '',
  featuredMediaId: '',
  featuredMediaUrl: '',
  seoTitle: '',
  seoDescription: '',
  ogImage: '',
  visibility: 'public',
  template: 'default',
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

export const PageEditor = () => {
  const { id: pageId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [pickerState, setPickerState] = useState({ open: false, mode: 'editor' });
  const [slugTouched, setSlugTouched] = useState(false);
  const quillRef = useRef(null);

  const isEditing = useMemo(() => Boolean(pageId), [pageId]);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        ['blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  const quillFormats = useMemo(
    () => ['header', 'bold', 'italic', 'underline', 'blockquote', 'list', 'bullet', 'link'],
    []
  );

  useEffect(() => {
    if (!isEditing) return;
    const fetchPage = async () => {
      setFetching(true);
      setError(null);
      setErrorCode(null);
      try {
        const page = await fetchPageById(pageId);
        if (!page) throw new Error('Page introuvable');
        setFormData({
          title: page.title || '',
          slug: page.slug || '',
          content: page.content || '',
          excerpt: page.excerpt || '',
          status: page.status || 'draft',
          publishedAt: page.publishedAt ? page.publishedAt.slice(0, 16) : '',
          featuredMediaId: page.featuredMediaId?._id || page.featuredMediaId || '',
          featuredMediaUrl:
            page.featuredMediaUrl || page.featuredMediaId?.url || page.featuredMediaId?.original?.url || '',
          seoTitle: page.seoTitle || '',
          seoDescription: page.seoDescription || '',
          ogImage: page.ogImage || '',
          visibility: page.visibility || 'public',
          template: page.template || 'default',
        });
        setSlugTouched(Boolean(page.slug));
      } catch (err) {
        setError(err.message);
        setErrorCode(err.status || (err.message === 'Page introuvable' ? 404 : null));
        addToast(`Impossible de charger la page : ${err.message}`, { type: 'error' });
      } finally {
        setFetching(false);
      }
    };

    fetchPage();
  }, [addToast, isEditing, pageId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      if (name === 'title' && !slugTouched) {
        return {
          ...prev,
          title: value,
          slug: value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSlugChange = (event) => {
    const value = event.target.value;
    setSlugTouched(true);
    setFormData((prev) => ({
      ...prev,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''),
    }));
  };

  const insertIntoContent = (snippet) => {
    setFormData((prev) => {
      const editor = quillRef.current?.getEditor();
      if (!editor) {
        return { ...prev, content: `${prev.content || ''}\n${snippet}` };
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

  const handleInlineUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const response = await uploadMedia(file);
      const media = response?.media || response;
      if (media) {
        insertMediaEmbed(media);
      }
      addToast('Média inséré dans le contenu.', { type: 'success' });
    } catch (err) {
      addToast(`Upload impossible : ${err.message}`, { type: 'error' });
    } finally {
      event.target.value = '';
    }
  };

  const handleFeaturedUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const response = await uploadMedia(file);
      const media = response?.media || response;
      const url = resolveMediaUrl(media.original?.url || media.originalUrl || media.url || response?.url);
      setFormData((prev) => ({
        ...prev,
        featuredMediaId: media?._id || prev.featuredMediaId,
        featuredMediaUrl: url || prev.featuredMediaUrl,
      }));
      addToast('Média mis à jour.', { type: 'success' });
    } catch (err) {
      addToast(`Upload impossible : ${err.message}`, { type: 'error' });
    } finally {
      event.target.value = '';
    }
  };

  const handlePickerSelect = (selected) => {
    if (pickerState.mode === 'featured') {
      const media = selected[0];
      const url = resolveMediaUrl(media.original?.url || media.originalUrl || media.url);
      setFormData((prev) => ({
        ...prev,
        featuredMediaId: media._id,
        featuredMediaUrl: url || prev.featuredMediaUrl,
      }));
      return;
    }
    selected.forEach((media) => insertMediaEmbed(media));
  };

  const handleSubmit = async (event, { overrideStatus } = {}) => {
    event.preventDefault();
    if (!formData.title?.trim()) {
      setError('Le titre est obligatoire.');
      addToast('Le titre est obligatoire.', { type: 'error' });
      return;
    }
    if (!formData.content?.trim()) {
      setError('Le contenu est obligatoire.');
      addToast('Le contenu est obligatoire.', { type: 'error' });
      return;
    }

    const nextStatus = overrideStatus || formData.status;
    if (nextStatus === 'scheduled' && !formData.publishedAt) {
      setError('Veuillez choisir une date de publication.');
      addToast('Veuillez choisir une date de publication.', { type: 'error' });
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      title: formData.title,
      slug: formData.slug || undefined,
      content: sanitizeHtml(formData.content),
      excerpt: formData.excerpt || undefined,
      status: nextStatus,
      publishedAt: formData.publishedAt || undefined,
      featuredMediaId: formData.featuredMediaId || undefined,
      featuredMediaUrl: formData.featuredMediaUrl || undefined,
      seoTitle: formData.seoTitle || undefined,
      seoDescription: formData.seoDescription || undefined,
      ogImage: formData.ogImage || undefined,
      visibility: formData.visibility || undefined,
      template: formData.template || undefined,
    };

    try {
      if (isEditing) {
        await updatePage(pageId, payload);
        addToast('Page mise à jour.', { type: 'success' });
      } else {
        await createPage(payload);
        addToast('Page créée.', { type: 'success' });
        navigate('/pages', { replace: true, state: { refresh: Date.now() } });
      }
    } catch (err) {
      setError(err.message);
      setErrorCode(err.status || null);
      addToast(`Impossible d'enregistrer : ${err.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (errorCode === 403) {
    return <AccessDenied message="Vous n'avez pas accès à cet éditeur de pages." />;
  }

  const featuredPreview = formData.featuredMediaUrl
    ? resolveMediaUrl(formData.featuredMediaUrl)
    : null;

  const sidebarSections = [
    {
      title: 'Statut & publication',
      content: (
        <div className="form-grid">
          <StatusSelect value={formData.status} onChange={(value) => setFormData((prev) => ({ ...prev, status: value }))} />
          {formData.status === 'scheduled' ? (
            <label className="form-field">
              Date de publication
              <input
                type="datetime-local"
                name="publishedAt"
                value={formData.publishedAt}
                onChange={handleChange}
              />
            </label>
          ) : null}
          <div className="page-action-group">
            <button
              className="button secondary"
              type="button"
              onClick={(event) => handleSubmit(event, { overrideStatus: 'draft' })}
              disabled={loading}
            >
              Enregistrer le brouillon
            </button>
            {formData.status === 'scheduled' ? (
              <button
                className="button"
                type="button"
                onClick={(event) => handleSubmit(event, { overrideStatus: 'scheduled' })}
                disabled={loading}
              >
                Programmer
              </button>
            ) : (
              <button
                className="button"
                type="button"
                onClick={(event) => handleSubmit(event, { overrideStatus: 'published' })}
                disabled={loading}
              >
                {isEditing ? 'Mettre à jour' : 'Publier'}
              </button>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Média mis en avant',
      content: (
        <FeaturedMediaField
          previewUrl={featuredPreview}
          onPick={() => setPickerState({ open: true, mode: 'featured' })}
          onUpload={handleFeaturedUpload}
          onClear={
            formData.featuredMediaId || formData.featuredMediaUrl
              ? () =>
                  setFormData((prev) => ({
                    ...prev,
                    featuredMediaId: '',
                    featuredMediaUrl: '',
                  }))
              : null
          }
          helper="Ajoutez une image héro ou une vidéo de couverture."
        />
      ),
    },
    {
      title: 'SEO',
      content: <SeoFields values={formData} onChange={handleChange} />,
    },
    {
      title: 'Paramètres',
      content: (
        <div className="form-grid">
          <label className="form-field">
            Visibilité
            <select name="visibility" value={formData.visibility} onChange={handleChange}>
              <option value="public">Public</option>
              <option value="private">Privé</option>
            </select>
          </label>
          <label className="form-field">
            Template
            <select name="template" value={formData.template} onChange={handleChange}>
              <option value="default">Default</option>
              <option value="landing">Landing</option>
              <option value="article">Article</option>
            </select>
          </label>
        </div>
      ),
    },
  ];

  return (
    <form className="page-editor" onSubmit={handleSubmit}>
      <PageEditorLayout
        main={
          <div className="page-editor-stack">
            <div className="page-card">
              <div className="form-grid">
                <label className="form-field">
                  Titre
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: À propos de Trustplay"
                  />
                </label>
                <SlugInput
                  value={formData.slug}
                  onChange={handleSlugChange}
                  helper="Généré automatiquement à partir du titre, modifiable à tout moment."
                />
                <label className="form-field">
                  Extrait
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="Résumé court pour les listes ou SEO."
                  />
                </label>
              </div>
            </div>

            <div className="page-card">
              <div className="page-card__header">
                <h3>Contenu</h3>
                {fetching ? <span className="helper">Chargement…</span> : null}
              </div>
              <EditorToolbar
                onInsertMedia={() => setPickerState({ open: true, mode: 'editor' })}
                onUploadMedia={handleInlineUpload}
              />
              <div className="page-editor-quill">
                <ReactQuill
                  ref={quillRef}
                  value={formData.content}
                  onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Rédigez votre page..."
                />
              </div>
            </div>
            {error ? <div className="notice">{error}</div> : null}
          </div>
        }
        sidebar={<PageMetaSidebar sections={sidebarSections} />}
      />

      <MediaPicker
        open={pickerState.open}
        onClose={() => setPickerState({ open: false, mode: 'editor' })}
        onSelect={handlePickerSelect}
        multiple={pickerState.mode === 'editor'}
      />
    </form>
  );
};
