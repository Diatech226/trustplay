import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImageFile, uploadMediaFile } from '../utils/uploadImage';
import { apiRequest } from '../utils/apiClient';
import { ALL_SUBCATEGORIES, normalizeSubCategory, PRIMARY_SUBCATEGORIES } from '../utils/categories';

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
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORY_OPTIONS[0].value,
    subCategory: PRIMARY_SUBCATEGORIES[0].value,
    content: '',
    image: '',
    eventDate: '',
    location: '',
    isPaid: false,
    price: 0,
  });

  const handleUploadImage = async () => {
    if (!file) {
      setUploadError('Merci de sélectionner une image.');
      return;
    }
    try {
      setUploadError('');
      setUploading(true);
      const imageUrl = await uploadImageFile(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishError('');
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
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
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
                subCategory: e.target.value === 'TrustMedia' ? PRIMARY_SUBCATEGORIES[0].value : '',
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
          {ALL_SUBCATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
            ))}
          </Select>
        )}

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
        {formData.image && <img src={formData.image} alt='upload' className='w-full h-72 object-cover' />}

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

        <Button type='submit' gradientDuoTone='purpleToPink' disabled={submitting || uploading}>
          {submitting ? 'Publication...' : 'Publier'}
        </Button>

        {publishError && <Alert className='mt-5' color='failure'>{publishError}</Alert>}
      </form>
    </div>
  );
}
