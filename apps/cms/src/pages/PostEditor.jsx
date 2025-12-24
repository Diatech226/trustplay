import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadMedia } from '../services/media.service';
import { createPost, fetchPostById, updatePost } from '../services/posts.service';
import { useToast } from '../components/ToastProvider';

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
};

export const PostEditor = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadMedia(file);
      setFormData((prev) => ({ ...prev, image: data.url || prev.image }));
      addToast('Fichier uploadé avec succès.', { type: 'success' });
    } catch (err) {
      addToast(`Upload impossible : ${err.message}`, { type: 'error' });
    }
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
          <textarea name="content" value={formData.content} onChange={handleChange} required />
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
          <span className="helper">Vous pouvez coller une URL ou uploader un média.</span>
        </label>
        <label>
          Upload média
          <input type="file" onChange={handleUpload} />
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
    </div>
  );
};
