import { useEffect, useMemo, useState } from 'react';
import { Select } from 'flowbite-react';
import PostCard from './PostCard';
import Breadcrumbs from './Breadcrumbs';
import PageContainer from './layout/PageContainer';
import PageHeader from './layout/PageHeader';
import Seo from './Seo';
import PostCardSkeleton from './skeletons/PostCardSkeleton';
import { apiRequest } from '../utils/apiClient';
import { normalizeSubCategory } from '../utils/categories';

const DEFAULT_LIMIT = 12;

const sortOptions = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'asc', label: 'Plus anciens' },
  { value: 'popular', label: 'Populaires' },
];

const popularityFields = ['views', 'reads', 'readCount', 'likes'];
const getTimestamp = (item) => new Date(item?.createdAt || item?.updatedAt || 0).getTime();

export default function CategoryPageLayout({ title, subCategory, description = '', path }) {
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
        const normalizedSub = normalizeSubCategory(subCategory);
        if (normalizedSub) {
          params.set('subCategory', normalizedSub);
        }

        if (sort === 'asc') {
          params.set('sort', 'asc');
        } else if (sort === 'recent') {
          params.set('sort', 'desc');
        } else if (sort === 'popular') {
          params.set('sort', 'desc');
          params.set('sortBy', 'views');
        }

        const data = await apiRequest(`/api/posts?${params.toString()}`);

        let fetchedPosts = (data.posts || data.data?.posts || []).map((post) => ({
          ...post,
          subCategory: normalizeSubCategory(post.subCategory),
        }));
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
  }, [sort, subCategory]);

  return (
    <main className='min-h-screen bg-mist/60 py-8 dark:bg-slate-950'>
      <Seo title={`${title} | Trust Media`} description={description || `Retrouvez les derniers articles ${title}.`} />
      <PageContainer className='space-y-6'>
        <Breadcrumbs items={breadcrumbs} />
        <PageHeader
          kicker='Rubrique'
          title={title}
          description={description}
          action={(
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
          )}
        />

        {error && (
          <p className='rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800'>
            {error}
          </p>
        )}
        {loading ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <PostCardSkeleton key={`category-${index}`} />
            ))}
          </div>
        ) : posts.length ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className='text-center text-gray-500 dark:text-slate-300'>Aucun article dans cette rubrique pour le moment.</p>
        )}
      </PageContainer>
    </main>
  );
}
