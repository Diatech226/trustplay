import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImageFile } from '../utils/uploadImage';

const MEDIA_SUBCATEGORIES = [
  { value: 'news', label: 'News' },
  { value: 'politique', label: 'Politique' },
  { value: 'science', label: 'Science/Tech' },
  { value: 'sport', label: 'Sport' },
  { value: 'cinema', label: 'Cinéma' },
];

const CATEGORY_OPTIONS = [
  { value: 'TrustMedia', label: 'Média' },
  { value: 'TrustEvent', label: 'Événement' },
  { value: 'TrustProduction', label: 'Production' },
];

export default function CreatePost() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
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
  });

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
      setPublishError('Authentification requise pour publier.');
      return;
    }

    if (formData.category === 'TrustMedia' && !formData.subCategory) {
      setPublishError('Merci de sélectionner une rubrique éditoriale.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/post/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message || 'La publication a échoué.');
        return;
      }

      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('Une erreur est survenue, veuillez réessayer.');
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
                subCategory: e.target.value === 'TrustMedia' ? MEDIA_SUBCATEGORIES[0].value : '',
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
            {MEDIA_SUBCATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}

        {formData.category === 'TrustEvent' && (
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
          placeholder='Rédigez votre contenu...'
          className='h-72 mb-12'
          required
          value={formData.content}
          onChange={(value) => setFormData({ ...formData, content: value })}
        />

        <Button type='submit' gradientDuoTone='purpleToPink'>
          Publier
        </Button>

        {publishError && <Alert className='mt-5' color='failure'>{publishError}</Alert>}
      </form>
    </div>
  );
}
