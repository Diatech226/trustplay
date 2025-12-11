import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../redux/user/userSlice';
import { uploadImageFile } from '../utils/uploadImage';

const MEDIA_SUBCATEGORIES = [
  { value: 'news', label: 'News' },
  { value: 'politique', label: 'Politique' },
  { value: 'economie', label: 'Économie' },
  { value: 'culture', label: 'Culture' },
  { value: 'technologie', label: 'Technologie' },
  { value: 'sport', label: 'Sport' },
  { value: 'portraits', label: 'Portraits' },
  // Legacy sub categories kept for backward compatibility
  { value: 'science', label: 'Science/Tech' },
  { value: 'cinema', label: 'Cinéma' },
];

const CATEGORY_OPTIONS = [
  { value: 'TrustMedia', label: 'Média' },
  { value: 'TrustEvent', label: 'Événement' },
  { value: 'TrustProduction', label: 'Production' },
];

export default function UpdatePost() {
  const { postId } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [publishError, setPublishError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORY_OPTIONS[0].value,
    subCategory: MEDIA_SUBCATEGORIES[0].value,
    content: '',
    image: '',
    eventDate: '',
    location: '',
    isPaid: false,
    price: 0,
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        if (!res.ok) {
          setPublishError(data.message || 'Impossible de récupérer le post.');
          return;
        }
        if (data.posts && data.posts[0]) {
          const fetchedPost = data.posts[0];
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
            // CMS: events (TrustEvent)
            eventDate: fetchedPost.eventDate || '',
            location: fetchedPost.location || '',
            isPaid: Boolean(fetchedPost.isPaid),
            price: fetchedPost.price || 0,
          }));
        }
      } catch (error) {
        setPublishError('Impossible de récupérer le post.');
      }
    };

    fetchPost();
  }, [postId, API_URL]);

  const handleUploadImage = async () => {
    if (!file) {
      setUploadError('Merci de sélectionner une image.');
      return;
    }
    try {
      setUploadError('');
      setUploading(true);
      const imageUrl = await uploadImageFile(file, API_URL);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishError('');
    const token = localStorage.getItem('token');

    if (!token) {
      setPublishError('Authentification requise pour mettre à jour.');
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
      const res = await fetch(
        `${API_URL}/api/post/updatepost/${formData._id}/${currentUser?._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message || 'La mise à jour a échoué.');
        return;
      }

      if (data.user) {
        dispatch(setUser(data.user));
      }
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('Une erreur est survenue, veuillez réessayer.');
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Modifier l’article</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
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
                subCategory: e.target.value === 'TrustMedia' ? prev.subCategory || MEDIA_SUBCATEGORIES[0].value : '',
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
            {MEDIA_SUBCATEGORIES.map((option) => (
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
          theme='snow'
          value={formData.content}
          placeholder='Rédigez votre contenu...'
          className='h-72 mb-12'
          required
          onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
        />
        <Button type='submit' gradientDuoTone='purpleToPink'>
          Mettre à jour
        </Button>
        {publishError && <Alert className='mt-5' color='failure'>
          {publishError}
        </Alert>}
      </form>
    </div>
  );
}
