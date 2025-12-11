'use client';

import { useState, FormEvent } from 'react';
import slugify from 'slugify';

interface Props {
  postId?: string;
  initialData?: Partial<{
    title: string;
    subCategory: string;
    content: string;
    imageUrl: string;
    isPublished: boolean;
  }>;
}

export default function PostForm({ postId, initialData }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [subCategory, setSubCategory] = useState(initialData?.subCategory ?? 'news');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '');
  const [isPublished, setPublished] = useState(initialData?.isPublished ?? true);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('Enregistrement...');
    const payload = {
      title,
      slug: slugify(title, { lower: true, strict: true }),
      subCategory,
      category: 'TrustMedia',
      content,
      imageUrl,
      isPublished,
    };
    const method = postId ? 'PUT' : 'POST';
    const endpoint = postId ? `/api/posts/${postId}` : '/api/posts';

    try {
      const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('API error');
      setMessage('Post enregistré.');
    } catch (error) {
      setMessage('Impossible de sauvegarder le post.');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Titre</label>
        <input className="mt-1 w-full rounded-md border px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Sous-catégorie</label>
          <select className="mt-1 w-full rounded-md border px-3 py-2" value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
            <option value="news">News</option>
            <option value="politique">Politique</option>
            <option value="economie">Économie</option>
            <option value="culture">Culture</option>
            <option value="technologie">Technologie</option>
            <option value="sport">Sport</option>
            <option value="portraits">Portraits</option>
          </select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={isPublished} onChange={(e) => setPublished(e.target.checked)} />
          <span>Publier</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Image URL</label>
        <input className="mt-1 w-full rounded-md border px-3 py-2" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <p className="text-xs text-slate-500">Utilisez l'API /api/upload pour déposer une image et coller l'URL ici.</p>
      </div>
      <div>
        <label className="block text-sm font-medium">Contenu</label>
        <textarea
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <button type="submit" className="rounded-full bg-primary px-4 py-2 text-white">
        {postId ? 'Mettre à jour' : 'Créer'}
      </button>
      {message && <p className="text-sm text-secondary">{message}</p>}
    </form>
  );
}
