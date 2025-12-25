import { Button, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import PostCard from '../components/PostCard';
import PostCardSkeleton from '../components/skeletons/PostCardSkeleton';
import Seo from '../components/Seo';
import { getMediaPosts, normalizePosts } from '../services/posts.service';
import { useRubrics } from '../hooks/useRubrics';
import { MEDIA_CATEGORY, normalizeSubCategory } from '../utils/categories';

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'recent',
    subCategory: 'all',
    dateRange: 'any',
    tags: '',
    category: MEDIA_CATEGORY,
  });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState(9);
  const { rubrics: trustMediaRubrics } = useRubrics('TrustMedia');

  const location = useLocation();

  const navigate = useNavigate();
  const defaultPageSize = 9;


  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm') || '';
    const orderFromUrl = urlParams.get('order');
    const rawSortFromUrl = urlParams.get('sort') || (orderFromUrl === 'asc' ? 'asc' : 'recent');
    const allowedSorts = new Set(['recent', 'asc', 'popular', 'relevance']);
    const sortFromUrl = allowedSorts.has(rawSortFromUrl) ? rawSortFromUrl : 'recent';
    const normalizedParam = normalizeSubCategory(urlParams.get('subCategory') || '');
    const allowedSubCategories = new Set(trustMediaRubrics.map((rubric) => rubric.slug));
    const subCategoryFromUrl =
      normalizedParam && allowedSubCategories.has(normalizedParam) ? normalizedParam : 'all';
    const featuredFromUrl = urlParams.get('featured');
    const dateRangeFromUrl = urlParams.get('dateRange') || (featuredFromUrl === 'today' ? '24h' : 'any');
    const tagsFromUrl = urlParams.get('tags') || '';
    const categoryFromUrl = urlParams.get('category') || MEDIA_CATEGORY;
    const limitFromUrl = Number.parseInt(urlParams.get('limit') || '', 10);
    const startIndexFromUrl = Number.parseInt(urlParams.get('startIndex') || '0', 10);
    const nextPageSize = Number.isFinite(limitFromUrl) && limitFromUrl > 0 ? limitFromUrl : defaultPageSize;
    const nextFilters = {
      searchTerm: searchTermFromUrl,
      sort: sortFromUrl,
      subCategory: subCategoryFromUrl,
      dateRange: dateRangeFromUrl,
      tags: tagsFromUrl,
      category: categoryFromUrl,
    };

    setSidebarData(nextFilters);
    setPageSize(nextPageSize);

    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const { posts: fetchedPosts } = await getMediaPosts({
          searchTerm: searchTermFromUrl || undefined,
          subCategory: subCategoryFromUrl === 'all' ? undefined : subCategoryFromUrl,
          order: sortFromUrl === 'asc' ? 'asc' : 'desc',
          limit: nextPageSize,
          startIndex: Number.isFinite(startIndexFromUrl) && startIndexFromUrl > 0 ? startIndexFromUrl : 0,
        });
        const normalizedPosts = normalizePosts(fetchedPosts);
        const filtered = applyAdvancedFilters(normalizedPosts, nextFilters);
        setPosts(filtered);
        setShowMore(fetchedPosts.length === nextPageSize);
      } catch (err) {
        setError('Impossible de récupérer les résultats.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [location.search, trustMediaRubrics]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSidebarData({ ...sidebarData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', sidebarData.searchTerm);
    urlParams.set('sort', sidebarData.sort);
    urlParams.set('dateRange', sidebarData.dateRange);
    urlParams.set('tags', sidebarData.tags);
    urlParams.set('category', MEDIA_CATEGORY);
    urlParams.delete('featured');
    urlParams.delete('order');
    if (sidebarData.subCategory === 'all') {
      urlParams.delete('subCategory');
    } else {
      urlParams.set('subCategory', normalizeSubCategory(sidebarData.subCategory));
    }
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    try {
      const { posts: fetchedPosts } = await getMediaPosts({
        searchTerm: sidebarData.searchTerm || undefined,
        subCategory: sidebarData.subCategory === 'all'
          ? undefined
          : normalizeSubCategory(sidebarData.subCategory),
        order: sidebarData.sort === 'asc' ? 'asc' : 'desc',
        limit: pageSize,
        startIndex,
      });
      const normalizedPosts = normalizePosts(fetchedPosts);
      const filtered = applyAdvancedFilters([...posts, ...normalizedPosts], sidebarData);
      setPosts(filtered);
      setShowMore(fetchedPosts.length === pageSize);
    } catch (err) {
      setError('Impossible de charger plus de résultats.');
    }
  };

  const applyAdvancedFilters = (list, filters) => {
    // advanced search
    let results = [...list];
    const normalizedFilterSub = normalizeSubCategory(filters.subCategory);
    if (filters.subCategory !== 'all' && normalizedFilterSub) {
      results = results.filter((item) => normalizeSubCategory(item.subCategory) === normalizedFilterSub);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter((item) =>
        item.title.toLowerCase().includes(term) || item.content?.toLowerCase().includes(term)
      );
    }
    if (filters.tags) {
      const tagsArray = filters.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      results = results.filter((item) =>
        tagsArray.every((tag) => item.content?.toLowerCase().includes(tag) || item.title.toLowerCase().includes(tag))
      );
    }
    if (filters.dateRange && filters.dateRange !== 'any') {
      const now = new Date();
      const ranges = { '24h': 1, '7d': 7, '30d': 30, '1y': 365 };
      const days = ranges[filters.dateRange];
      results = results.filter((item) => {
        const created = new Date(item.createdAt);
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);
        return diffDays <= days;
      });
    }
    if (filters.sort === 'popular') {
      results.sort((a, b) => (b.views || b.likes || 0) - (a.views || a.likes || 0));
    } else if (filters.sort === 'relevance') {
      results.sort((a, b) => (b?.title?.length || 0) - (a?.title?.length || 0));
    } else if (filters.sort === 'asc') {
      results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return results;
  };

  return (
    <main className='min-h-screen bg-mist/60 py-8 dark:bg-slate-950'>
      <Seo
        title='Recherche | Trust Media'
        description="Explorez les archives Trust Media grâce aux filtres avancés : rubrique, période, popularité et tags."
      />
      <PageContainer className='flex flex-col gap-6'>
        <PageHeader
          kicker='Recherche éditoriale'
          title='Explorez les archives Trust Media'
          description='Filtrez par rubrique, pertinence et date pour accéder rapidement aux articles qui comptent.'
        />

        <div className='grid gap-6 lg:grid-cols-[320px,1fr]'>
          <div className='rounded-2xl bg-white p-5 shadow-card ring-1 ring-subtle dark:bg-slate-900 dark:ring-slate-800'>
            <h2 className='mb-4 text-lg font-semibold text-primary'>Filtres</h2>
            <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Rechercher</label>
                <TextInput
                  placeholder='Mot-clé, rubrique...'
                  id='searchTerm'
                  type='text'
                  value={sidebarData.searchTerm}
                  onChange={handleChange}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Trier</label>
                <Select onChange={handleChange} value={sidebarData.sort} id='sort'>
                  <option value='recent'>Les plus récents</option>
                  <option value='asc'>Les plus anciens</option>
                  <option value='popular'>Les plus populaires</option>
                  <option value='relevance'>Pertinence</option>
                </Select>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Rubrique</label>
                <Select onChange={handleChange} value={sidebarData.subCategory} id='subCategory'>
                  <option value='all'>Toutes</option>
                  {trustMediaRubrics.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Période</label>
                <Select onChange={handleChange} value={sidebarData.dateRange} id='dateRange'>
                  <option value='any'>Toutes dates</option>
                  <option value='24h'>Dernières 24h</option>
                  <option value='7d'>7 jours</option>
                  <option value='30d'>30 jours</option>
                  <option value='1y'>Dernière année</option>
                </Select>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Tags</label>
                <TextInput
                  id='tags'
                  placeholder='ex: climat, IA'
                  value={sidebarData.tags}
                  onChange={handleChange}
                  helperText='Séparez les tags par une virgule'
                />
              </div>
              <Button type='submit' gradientDuoTone='purpleToPink' className='w-full'>
                Appliquer les filtres
              </Button>
            </form>
          </div>

          <div className='rounded-2xl bg-white/80 p-5 shadow-subtle ring-1 ring-subtle backdrop-blur dark:bg-slate-900/80 dark:ring-slate-800'>
            <div className='flex items-center justify-between gap-4 border-b border-subtle pb-4 dark:border-slate-800'>
              <h2 className='text-2xl font-bold text-primary'>Résultats</h2>
              <span className='text-sm text-slate-500 dark:text-slate-300'>{posts.length} articles</span>
            </div>
            {error && (
              <p className='mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800'>
                {error}
              </p>
            )}
            <div className='mt-5 grid gap-5 md:grid-cols-2'>
              {loading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <PostCardSkeleton key={`search-${index}`} />
                ))}
              {!loading && posts.length === 0 && (
                <div className='col-span-full rounded-xl border border-dashed border-subtle bg-subtle/30 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200'>
                  Aucun résultat trouvé. Essayez d'autres mots-clés ou changez de rubrique.
                </div>
              )}
              {!loading && posts && posts.map((post) => <PostCard key={post._id} post={post} />)}
            </div>
            {showMore && (
              <button
                onClick={handleShowMore}
                className='mt-6 w-full rounded-full border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white'
              >
                Voir plus
              </button>
            )}
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
