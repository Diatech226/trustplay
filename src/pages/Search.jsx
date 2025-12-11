import { Button, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'recent',
    subCategory: 'all',
    dateRange: 'any',
    tags: '',
  });
  const API_URL = import.meta.env.VITE_API_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();


  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm') || '';
    const sortFromUrl = urlParams.get('sort') || 'recent';
    const subCategoryFromUrl = urlParams.get('subCategory') || 'all';
    const dateRangeFromUrl = urlParams.get('dateRange') || 'any';
    const tagsFromUrl = urlParams.get('tags') || '';
    const nextFilters = {
      searchTerm: searchTermFromUrl,
      sort: sortFromUrl,
      subCategory: subCategoryFromUrl,
      dateRange: dateRangeFromUrl,
      tags: tagsFromUrl,
    };

    setSidebarData(nextFilters);

    const fetchPosts = async () => {
      setLoading(true);
      const queryParams = new URLSearchParams(location.search);
      const searchQuery = queryParams.toString();
      const res = await fetch(`${API_URL}/api/post/getposts?${searchQuery}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const filtered = applyAdvancedFilters(data.posts, nextFilters);
        setPosts(filtered);
        setLoading(false);
        if (data.posts.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      }
    };
    fetchPosts();
  }, [location.search, API_URL]);

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
    if (sidebarData.subCategory === 'all') {
      urlParams.delete('subCategory');
    } else {
      urlParams.set('subCategory', sidebarData.subCategory);
    }
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`${API_URL}/api/post/getposts?${searchQuery}`);
    if (!res.ok) {
      return;
    }
    if (res.ok) {
      const data = await res.json();
      const filtered = applyAdvancedFilters([...posts, ...data.posts], sidebarData);
      setPosts(filtered);
      if (data.posts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    }
  };

  const applyAdvancedFilters = (list, filters) => {
    // advanced search
    let results = [...list];
    if (filters.subCategory !== 'all') {
      results = results.filter((item) => item.subCategory === filters.subCategory);
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
    } else {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return results;
  };

  return (
    <div className='min-h-screen bg-mist/60 py-8 dark:bg-slate-950'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6 px-4'>
        <header className='flex flex-col gap-2 rounded-2xl bg-white/80 p-6 shadow-subtle ring-1 ring-subtle backdrop-blur dark:bg-slate-900/80 dark:ring-slate-800'>
          <p className='text-xs font-semibold uppercase tracking-[0.25em] text-primary'>Recherche éditoriale</p>
          <h1 className='text-3xl font-extrabold text-primary'>Explorez les archives Trust Media</h1>
          <p className='text-slate-600 dark:text-slate-300'>
            Filtrez par rubrique, pertinence et date pour accéder rapidement aux articles qui comptent.
          </p>
        </header>

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
                  <option value='popular'>Les plus populaires</option>
                  <option value='relevance'>Pertinence</option>
                </Select>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Rubrique</label>
                <Select onChange={handleChange} value={sidebarData.subCategory} id='subCategory'>
                  <option value='all'>Toutes</option>
                  <option value='news'>News</option>
                  <option value='politique'>Politique</option>
                  <option value='science'>Science/Tech</option>
                  <option value='sport'>Sport</option>
                  <option value='cinema'>Cinéma</option>
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
            <div className='mt-5 grid gap-5 md:grid-cols-2'>
              {!loading && posts.length === 0 && (
                <div className='col-span-full rounded-xl border border-dashed border-subtle bg-subtle/30 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200'>
                  Aucun résultat trouvé. Essayez d'autres mots-clés ou changez de rubrique.
                </div>
              )}
              {loading && <p className='text-slate-500'>En téléchargement...</p>}
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
      </div>
    </div>
  );
}
