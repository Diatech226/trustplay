import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/user/userSlice';
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

export default function UpdatePost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const quillRef = useRef(null);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [publishError, setPublishError] = useState('');
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
    const fetchPost = async () => {
      try {
        const data = await apiRequest(`/api/posts?postId=${postId}`);
        const fetchedPost = data.posts?.[0] || data.data?.posts?.[0];
        if (fetchedPost) {
          const normalizedCategory =
            fetchedPost.category === 'Media'
              ? 'TrustMedia'
              : fetchedPost.category === 'Event'
              ? 'TrustEvent'
              : fetchedPost.category;
          setFormData((prev) => ({
            ...prev,
            ...fetchedPost,
            category: normalizedCategory,
            subCategory: normalizeSubCategory(fetchedPost.subCategory) || '',
            // CMS: events (TrustEvent)
            eventDate: fetchedPost.eventDate || '',
            location: fetchedPost.location || '',
            isPaid: Boolean(fetchedPost.isPaid),
            price: fetchedPost.price || 0,
            tags: (fetchedPost.tags || []).join(', '),
            publishedAt: fetchedPost.publishedAt || '',
          }));
        }
      } catch (error) {
        setPublishError('Impossible de récupérer le post.');
      }
    };

    fetchPost();
  }, [postId]);

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

  const trustMediaOptions = useMemo(() => {
    const options = trustMediaRubrics.map((rubric) => ({ value: rubric.slug, label: rubric.label }));
    if (formData.subCategory && !options.find((option) => option.value === formData.subCategory)) {
      options.unshift({ value: formData.subCategory, label: `Legacy: ${formData.subCategory}` });
    }
    return options;
  }, [formData.subCategory, trustMediaRubrics]);

  const trustEventOptions = useMemo(() => {
    const options = trustEventRubrics.map((rubric) => ({ value: rubric.slug, label: rubric.label }));
    if (formData.subCategory && !options.find((option) => option.value === formData.subCategory)) {
      options.unshift({ value: formData.subCategory, label: `Legacy: ${formData.subCategory}` });
    }
    return options;
  }, [formData.subCategory, trustEventRubrics]);

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
    const targetStatus = nextStatus || formData.status;
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
      const postIdentifier = formData._id || formData.id || postId;
      const data = await apiRequest(`/api/posts/${postIdentifier}`, {
        method: 'PUT',
        auth: true,
        body: {
          ...formData,
          subCategory: normalizeSubCategory(formData.subCategory),
          status: targetStatus,
        },
      });

      if (data.user) {
        dispatch(setUser(data.user));
      }
      const slug = data.slug || data.post?.slug || formData.slug;
      navigate(slug ? `/post/${slug}` : '/');
    } catch (error) {
      setPublishError('Une erreur est survenue, veuillez réessayer.');
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Modifier l’article</h1>
      <form className='flex flex-col gap-4' onSubmit={(e) => handleSubmit(e, formData.status)}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Titre'
            required
            id='title'
            className='flex-1'
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            value={formData.title}
          />
            <Select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value,
                  subCategory:
                    e.target.value === 'TrustMedia'
                      ? prev.subCategory || trustMediaRubrics[0]?.slug || ''
                      : e.target.value === 'TrustEvent'
                        ? prev.subCategory || trustEventRubrics[0]?.slug || ''
                        : '',
                }))
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
            value={formData.subCategory || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
          >
            <option value=''>Choisir une rubrique</option>
            {trustMediaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
        {formData.category === 'TrustEvent' && (
          <Select
            required
            value={formData.subCategory || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
          >
            <option value=''>Choisir une rubrique événementielle</option>
            {trustEventOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}

        <div className='grid gap-4 md:grid-cols-2'>
          <Select
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value='draft'>Brouillon</option>
            <option value='review'>En relecture</option>
            <option value='scheduled'>Programmé</option>
            <option value='published'>Publié</option>
          </Select>
          <TextInput
            type='datetime-local'
            value={(formData.publishedAt || '').toString().slice(0, 16)}
            onChange={(e) => setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))}
            helperText='Date/heure de publication'
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
                value={formData.eventDate || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, eventDate: e.target.value }))}
                placeholder='Date de l’événement'
              />
              <TextInput
                type='text'
                required
                value={formData.location || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Lieu de l’événement"
              />
            </div>
            <div className='flex flex-col gap-4 sm:flex-row justify-between'>
              <Select
                value={formData.isPaid ? 'paid' : 'free'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPaid: e.target.value === 'paid',
                    price: e.target.value === 'paid' ? prev.price || 0 : 0,
                  }))
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                  }
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
            onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
          />
          <label className='flex items-center gap-2 text-sm font-semibold'>
            <input
              type='checkbox'
              checked={formData.featured}
              onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
            />
            Mettre en avant
          </label>
        </div>

        <div className='flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
          <p className='text-sm font-semibold text-slate-700 dark:text-slate-200'>SEO & partage</p>
          <TextInput
            placeholder='Titre SEO (optionnel)'
            value={formData.seoTitle}
            onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
          />
          <TextInput
            placeholder='Description SEO (160 caractères)'
            value={formData.seoDescription}
            onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
          />
          <TextInput
            placeholder="Image Open Graph (URL)"
            value={formData.ogImage}
            onChange={(e) => setFormData((prev) => ({ ...prev, ogImage: e.target.value }))}
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
        {(formData.imageCover || formData.imageOriginal || formData.image) && (
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
          value={formData.content}
          placeholder='Rédigez votre contenu...'
          className='h-72 mb-12'
          required
          onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
          modules={quillModules}
          formats={quillFormats}
        />
        <div className='flex flex-wrap gap-3'>
          <Button type='submit' gradientDuoTone='purpleToPink'>
            Mettre à jour
          </Button>
          <Button color='light' type='button' onClick={(e) => handleSubmit(e, 'draft')}>
            Repasse en brouillon
          </Button>
          <Button color='warning' type='button' onClick={(e) => handleSubmit(e, 'review')}>
            Envoyer en relecture
          </Button>
          <Button color='success' type='button' onClick={(e) => handleSubmit(e, 'published')}>
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
        {publishError && <Alert className='mt-5' color='failure'>
          {publishError}
        </Alert>}
      </form>
    </div>
  );
}
