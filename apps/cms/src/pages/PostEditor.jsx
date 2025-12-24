import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, uploadFile } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';

const emptyForm = {
  title: '',
  content: '',
  category: 'TrustMedia',
  subCategory: '',
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
  const { postId } = useParams();
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
        const response = await apiClient.get(`/api/posts?postId=${postId}`);
        const post = response?.posts?.[0] || response?.data?.posts?.[0] || response?.post || response?.data?.post;
        if (!post) throw new Error('Post introuvable');
        setFormData({
          title: post.title || '',
          content: post.content || '',
          category: post.category || 'TrustMedia',
          subCategory: post.subCategory || '',
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadFile(file);
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
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: formData.publishedAt || undefined,
    };

    try {
      if (isEditing) {
        await apiClient.put(`/api/posts/${postId}`, { body: payload });
        addToast('Post mis à jour.', { type: 'success' });
      } else {
        await apiClient.post('/api/posts', { body: payload });
        addToast('Post créé.', { type: 'success' });
      }
      navigate('/posts');
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
            <option value="TrustMedia">Trust Media</option>
            <option value="TrustEvent">Trust Event</option>
            <option value="TrustProd">Trust Prod</option>
            <option value="uncategorized">Non classé</option>
          </select>
        </label>
        <label>
          Sous-catégorie
          <input name="subCategory" value={formData.subCategory} onChange={handleChange} />
        </label>
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
