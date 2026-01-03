import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImageFile, uploadMediaFile } from '../utils/uploadImage';
import { apiRequest } from '../lib/apiClient';
import { normalizeSubCategory } from '../utils/categories';
import { useRubrics } from '../hooks/useRubrics';
import { DEFAULT_MEDIA_PLACEHOLDER, resolveMediaUrl } from '../lib/mediaUrls';

const CATEGORY_OPTIONS = [
  { value: 'TrustMedia', label: 'Média' },
  { value: 'TrustEvent', label: 'Événement' },
  { value: 'TrustProduction', label: 'Production' },
];

export default function CreatePost() {
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [publishError, setPublishError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { rubrics: trustMediaRubrics } = useRubrics('TrustMedia');
  const { rubrics: trustEventRubrics } = useRubrics('TrustEvent', { fallback: false });
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORY_OPTIONS[0].value,
    subCategory: '',
    content: '',
    image: '',
    imageOriginal: '',
    imageThumb: '',
    imageCover: '',
    imageMedium: '',
    imageThumbAvif: '',
    imageCoverAvif: '',
    imageMediumAvif: '',
    eventDate: '',
    location: '',
    isPaid: false,
    price: 0,
    status: 'draft',
    publishedAt: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    ogImage: '',
    featured: false,
  });

  useEffect(() => {
    const savedDraft = localStorage.getItem('cms:createPostDraft');
    if (savedDraft) {
      try {
        setFormData({ ...formData, ...JSON.parse(savedDraft) });
      } catch (error) {
        console.warn('Impossible de restaurer le brouillon', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('cms:createPostDraft', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (formData.category === 'TrustMedia' && !formData.subCategory && trustMediaRubrics.length) {
      setFormData((prev) => ({ ...prev, subCategory: trustMediaRubrics[0]?.slug || '' }));
    }
  }, [formData.category, formData.subCategory, trustMediaRubrics]);

  useEffect(() => {
    if (formData.category === 'TrustEvent' && !formData.subCategory && trustEventRubrics.length) {
      setFormData((prev) => ({ ...prev, subCategory: trustEventRubrics[0]?.slug || '' }));
    }
  }, [formData.category, formData.subCategory, trustEventRubrics]);

  const handleUploadImage = async () => {
    if (!file) {
      setUploadError('Merci de sélectionner une image.');
      return;
    }
    try {
      setUploadError('');
      setUploading(true);
      const uploaded = await uploadImageFile(file);
      const originalUrl = uploaded.originalUrl || uploaded.url;
      setFormData((prev) => ({
        ...prev,
        image: originalUrl || prev.image,
        imageOriginal: originalUrl || prev.imageOriginal,
        imageThumb: uploaded.thumbUrl || prev.imageThumb,
        imageCover: uploaded.coverUrl || prev.imageCover,
        imageMedium: uploaded.mediumUrl || prev.imageMedium,
        imageThumbAvif: uploaded.thumbAvifUrl || prev.imageThumbAvif,
        imageCoverAvif: uploaded.coverAvifUrl || prev.imageCoverAvif,
        imageMediumAvif: uploaded.mediumAvifUrl || prev.imageMediumAvif,
      }));
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const insertMediaIntoEditor = useCallback(
    async (type) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = type === 'image' ? 'image/*' : 'video/*';
      input.onchange = async () => {
        const selectedFile = input.files?.[0];
        if (!selectedFile) return;
        try {
          setUploading(true);
          const uploaded = await uploadMediaFile(selectedFile);
          const quill = quillRef.current?.getEditor();
          if (!quill || !uploaded.url) return;
          const range = quill.getSelection(true);
          const insertAt = range?.index ?? quill.getLength();
          quill.insertEmbed(insertAt, type, uploaded.url, 'user');
          quill.setSelection(insertAt + 1, 0);
        } catch (error) {
          setUploadError(error.message);
        } finally {
          setUploading(false);
        }
      };
      input.click();
    },
    []
  );

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video'],
          [{ align: [] }],
          ['clean'],
        ],
        handlers: {
          image: () => insertMediaIntoEditor('image'),
          video: () => insertMediaIntoEditor('video'),
        },
      },
    }),
    [insertMediaIntoEditor]
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
      'link',
      'image',
      'video',
      'align',
    ],
    []
  );

  const handleSubmit = async (e, nextStatus) => {
    e.preventDefault();
    setPublishError('');
    const targetStatus = nextStatus || formData.status || 'draft';
    if (formData.category === 'TrustMedia' && !formData.subCategory) {
      setPublishError('Merci de sélectionner une rubrique éditoriale.');
      return;
    }

    if (formData.category === 'TrustEvent') {
      if (!formData.eventDate || !formData.location) {
        setPublishError("Merci d'indiquer la date et le lieu de l'événement.");
        return;
      }

      if (formData.isPaid && (!formData.price || Number(formData.price) <= 0)) {
        setPublishError('Merci de renseigner un tarif valide.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const data = await apiRequest('/api/posts', {
        method: 'POST',
        auth: true,
        body: {
          ...formData,
          subCategory: normalizeSubCategory(formData.subCategory),
          status: targetStatus,
          tags: formData.tags,
          publishedAt: formData.publishedAt || undefined,
        },
      });

      const slug = data.slug || data.post?.slug || data.data?.post?.slug;
      navigate(slug ? `/post/${slug}` : '/');
    } catch (error) {
      setPublishError('Une erreur est survenue, veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Créer un article</h1>
      <form className='flex flex-col gap-4' onSubmit={(e) => handleSubmit(e, formData.status)}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Titre'
            required
            className='flex-1'
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value,
                subCategory: e.target.value === 'TrustMedia'
                  ? trustMediaRubrics[0]?.slug || ''
                  : e.target.value === 'TrustEvent'
                    ? trustEventRubrics[0]?.slug || ''
                    : '',
              })
            }
          >
            <option value=''>Choisir une catégorie</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
        </div>

        {formData.category === 'TrustMedia' && (
        <Select
          required
          value={formData.subCategory}
          onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
        >
          <option value=''>Choisir une rubrique</option>
          {trustMediaRubrics.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
          </Select>
        )}
        {formData.category === 'TrustEvent' && (
        <Select
          required
          value={formData.subCategory}
          onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
        >
          <option value=''>Choisir une rubrique événementielle</option>
          {trustEventRubrics.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </Select>
        )}

        <div className='grid gap-4 md:grid-cols-2'>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value='draft'>Brouillon</option>
            <option value='review'>En relecture</option>
            <option value='scheduled'>Programmé</option>
            <option value='published'>Publié</option>
          </Select>
          <TextInput
            type='datetime-local'
            value={formData.publishedAt}
            onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
            helperText='Date/heure de publication (optionnel)'
          />
        </div>

        {formData.category === 'TrustEvent' && (
          <div className='space-y-4 rounded-xl border border-dashed border-slate-200 p-4 dark:border-slate-700'>
            <p className='text-sm font-semibold text-slate-700 dark:text-slate-200'>
              {/* CMS: events (TrustEvent) */}
              Informations événement
            </p>
            <div className='flex flex-col gap-4 sm:flex-row justify-between'>
              <TextInput
                type='date'
                required
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                placeholder='Date de l’événement'
              />
              <TextInput
                type='text'
                required
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Lieu de l’événement"
              />
            </div>
            <div className='flex flex-col gap-4 sm:flex-row justify-between'>
              <Select
                value={formData.isPaid ? 'paid' : 'free'}
                onChange={(e) =>
                  setFormData({ ...formData, isPaid: e.target.value === 'paid', price: e.target.value === 'paid' ? formData.price || 0 : 0 })
                }
              >
                <option value='free'>Gratuit</option>
                <option value='paid'>Payant</option>
              </Select>
              {formData.isPaid && (
                <TextInput
                  type='number'
                  min={0}
                  step='0.01'
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder='Tarif en €'
                />
              )}
            </div>
          </div>
        )}

        <div className='grid gap-3 md:grid-cols-2'>
          <TextInput
            placeholder='Tags (séparés par des virgules)'
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
          <label className='flex items-center gap-2 text-sm font-semibold'>
            <input
              type='checkbox'
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            />
            Mettre en avant
          </label>
        </div>

        <div className='flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
          <p className='text-sm font-semibold text-slate-700 dark:text-slate-200'>SEO & partage</p>
          <TextInput
            placeholder='Titre SEO (optionnel)'
            value={formData.seoTitle}
            onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
          />
          <TextInput
            placeholder='Description SEO (160 caractères)'
            value={formData.seoDescription}
            onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
          />
          <TextInput
            placeholder="Image Open Graph (URL)"
            value={formData.ogImage}
            onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
          />
        </div>

        <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
          <FileInput type='file' accept='image/*' onChange={(e) => setFile(e.target.files[0])} />
          <Button
            type='button'
            gradientDuoTone='purpleToBlue'
            size='sm'
            outline
            onClick={handleUploadImage}
            disabled={uploading}
          >
            {uploading ? 'Téléversement...' : 'Uploader une image'}
          </Button>
        </div>

        {uploadError && <Alert color='failure'>{uploadError}</Alert>}
        {formData.image && (
          <img
            src={resolveMediaUrl(
              formData.imageCover || formData.imageOriginal || formData.image,
              DEFAULT_MEDIA_PLACEHOLDER
            )}
            alt='upload'
            loading='lazy'
            decoding='async'
            width='960'
            height='288'
            className='w-full h-72 object-cover'
          />
        )}

        <ReactQuill
        ref={quillRef}
        theme='snow'
        placeholder='Rédigez votre contenu...'
        className='h-72 mb-12'
        required
        value={formData.content}
        onChange={(value) => setFormData({ ...formData, content: value })}
        modules={quillModules}
        formats={quillFormats}
      />

        <div className='flex flex-wrap gap-3'>
          <Button type='submit' gradientDuoTone='purpleToPink' disabled={submitting || uploading}>
            {submitting ? 'Publication...' : 'Enregistrer'}
          </Button>
          <Button color='light' type='button' onClick={(e) => handleSubmit(e, 'draft')} disabled={submitting}>
            Sauvegarder en brouillon
          </Button>
          <Button color='warning' type='button' onClick={(e) => handleSubmit(e, 'review')} disabled={submitting}>
            Envoyer en relecture
          </Button>
          <Button color='success' type='button' onClick={(e) => handleSubmit(e, 'published')} disabled={submitting}>
            Publier
          </Button>
        </div>

        <div className='rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-slate-700'>
          <p className='mb-2 text-sm font-semibold text-slate-600 dark:text-slate-200'>Preview éditorial</p>
          <h2 className='text-xl font-bold text-primary'>{formData.title || 'Titre de votre article'}</h2>
          <p className='text-sm text-slate-600 dark:text-slate-300'>
            Statut : <span className='font-semibold capitalize'>{formData.status}</span> · Tags :{' '}
            {formData.tags || 'aucun tag'}
          </p>
          <p className='mt-2 line-clamp-3 text-slate-700 dark:text-slate-200'>
            {formData.seoDescription || formData.content.replace(/<[^>]+>/g, '').slice(0, 220) ||
              'Votre résumé apparaîtra ici pour vérification SEO.'}
          </p>
        </div>

        {publishError && <Alert className='mt-5' color='failure'>{publishError}</Alert>}
      </form>
    </div>
  );
}
