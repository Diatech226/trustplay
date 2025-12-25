import { useEffect, useMemo, useState } from 'react';
import { Select } from 'flowbite-react';
import PostCard from './PostCard';
import Breadcrumbs from './Breadcrumbs';
import PageContainer from './layout/PageContainer';
import PageHeader from './layout/PageHeader';
import Seo from './Seo';
import PostCardSkeleton from './skeletons/PostCardSkeleton';
import { getMediaPosts, normalizePosts } from '../services/posts.service';
import { normalizeSubCategory } from '../utils/categories';

const DEFAULT_LIMIT = 12;

const sortOptions = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'asc', label: 'Plus anciens' },
  { value: 'popular', label: 'Populaires' },
];

const dateFilters = [
  { value: 'all', label: 'Toutes les dates' },
  { value: '30d', label: '30 derniers jours' },
  { value: '7d', label: '7 derniers jours' },
];

const popularityFields = ['views', 'reads', 'readCount', 'likes'];
const getTimestamp = (item) => new Date(item?.createdAt || item?.updatedAt || 0).getTime();

export default function CategoryPageLayout({ title, subCategory, description = '', path }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dateFilter, setDateFilter] = useState('all');

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
        const normalizedSub = normalizeSubCategory(subCategory);
        if (sort === 'asc') {
          params.set('order', 'asc');
        } else if (sort === 'recent') {
          params.set('order', 'desc');
        }
        const { posts: fetchedPosts, totalPosts } = await getMediaPosts({
          subCategory: normalizedSub,
          limit: DEFAULT_LIMIT,
          startIndex: (page - 1) * DEFAULT_LIMIT,
          order: params.get('order') || 'desc',
        });

        let normalizedPosts = normalizePosts(fetchedPosts);
        if (dateFilter !== 'all') {
          const days = dateFilter === '30d' ? 30 : 7;
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          normalizedPosts = normalizedPosts.filter((post) => new Date(post.createdAt || post.updatedAt || 0) >= cutoff);
        }
        if (sort === 'popular') {
          normalizedPosts = [...normalizedPosts].sort((a, b) => {
            const score = (item) => {
              for (const field of popularityFields) {
                if (typeof item[field] === 'number') return item[field];
              }
              return 0;
            };
            return score(b) - score(a);
          });
        } else if (sort === 'asc' || sort === 'recent') {
          normalizedPosts = [...normalizedPosts].sort((a, b) =>
            sort === 'asc' ? getTimestamp(a) - getTimestamp(b) : getTimestamp(b) - getTimestamp(a)
          );
        }
        setPosts(normalizedPosts);
        setTotal(dateFilter === 'all' ? totalPosts : normalizedPosts.length);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sort, subCategory, page, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_LIMIT));

  const canonicalUrl = useMemo(() => {
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
  }, [path]);

  return (
    <main className='min-h-screen bg-mist/60 py-8 dark:bg-slate-950'>
      <Seo
        title={`${title} | Trust Media`}
        description={description || `Retrouvez les derniers articles ${title}.`}
        canonical={canonicalUrl}
      />
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
              <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                {dateFilters.map((option) => (
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
          <>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className='flex items-center justify-center gap-3 pt-6 text-sm text-slate-700 dark:text-slate-200'>
                <button
                  className='rounded-lg border px-3 py-2 disabled:opacity-50'
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </button>
                <span>
                  Page {page} / {totalPages}
                </span>
                <button
                  className='rounded-lg border px-3 py-2 disabled:opacity-50'
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        ) : (
          <p className='text-center text-gray-500 dark:text-slate-300'>Aucun article dans cette rubrique pour le moment.</p>
        )}
      </PageContainer>
    </main>
  );
}
