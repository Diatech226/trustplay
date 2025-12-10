import { useEffect, useMemo, useState } from 'react';
import { Select } from 'flowbite-react';
import PostCard from './PostCard';
import Breadcrumbs from './Breadcrumbs';

const DEFAULT_LIMIT = 12;

const sortOptions = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'asc', label: 'Plus anciens' },
  { value: 'popular', label: 'Populaires' },
];

const popularityFields = ['views', 'reads', 'readCount', 'likes'];
const getTimestamp = (item) => new Date(item?.createdAt || item?.updatedAt || 0).getTime();

export default function CategoryPageLayout({ title, subCategory, description = '', path }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('recent');

  const breadcrumbs = useMemo(
    () => [
      { label: 'Accueil', href: '/' },
      { label: title, href: path },
    ],
    [path, title]
  );

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('limit', DEFAULT_LIMIT);
        if (subCategory) {
          params.set('subCategory', subCategory);
        }

        if (sort === 'asc') {
          params.set('sort', 'asc');
        } else if (sort === 'recent') {
          params.set('sort', 'desc');
        } else if (sort === 'popular') {
          params.set('sort', 'desc');
          params.set('sortBy', 'views');
        }

        const res = await fetch(`${API_URL}/api/post/getposts?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Chargement impossible.');
        }

        let fetchedPosts = data.posts || [];
        if (sort === 'popular') {
          fetchedPosts = [...fetchedPosts].sort((a, b) => {
            const score = (item) => {
              for (const field of popularityFields) {
                if (typeof item[field] === 'number') return item[field];
              }
              return 0;
            };
            return score(b) - score(a);
          });
        } else if (sort === 'asc' || sort === 'recent') {
          fetchedPosts = [...fetchedPosts].sort((a, b) =>
            sort === 'asc' ? getTimestamp(a) - getTimestamp(b) : getTimestamp(b) - getTimestamp(a)
          );
        }
        setPosts(fetchedPosts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [API_URL, sort, subCategory]);

  return (
    <div className='max-w-6xl mx-auto p-4 min-h-screen'>
      <Breadcrumbs items={breadcrumbs} />
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
        <div>
          <h1 className='text-3xl font-bold text-teal-600'>{title}</h1>
          {description && <p className='text-gray-600 dark:text-gray-300 mt-1'>{description}</p>}
        </div>
        <div className='flex items-center gap-2'>
          <label className='font-semibold text-sm'>Trier par</label>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error && <p className='text-red-500 mb-4'>{error}</p>}
      {loading ? (
        <p className='text-center text-gray-500'>Chargement des articles...</p>
      ) : posts.length ? (
        <div className='flex flex-wrap gap-4 justify-center'>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <p className='text-center text-gray-500'>Aucun article dans cette rubrique pour le moment.</p>
      )}
    </div>
  );
}
