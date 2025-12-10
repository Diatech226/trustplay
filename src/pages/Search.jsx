import { Button, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    subCategory: 'all',
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
    const sortFromUrl = urlParams.get('sort') || 'desc';
    const subCategoryFromUrl = urlParams.get('subCategory') || 'all';
    const nextFilters = {
      searchTerm: searchTermFromUrl,
      sort: sortFromUrl,
      subCategory: subCategoryFromUrl,
    };

    setSidebarData(nextFilters);

    const fetchPosts = async () => {
      setLoading(true);
      const queryParams = new URLSearchParams(location.search);
      if (nextFilters.subCategory === 'all') {
        queryParams.delete('subCategory');
      }
      if (!nextFilters.searchTerm) {
        queryParams.delete('searchTerm');
      }
      queryParams.set('sort', nextFilters.sort || 'desc');
      if (!nextFilters.sort) {
        queryParams.delete('sort');
      }
      if (nextFilters.searchTerm) {
        queryParams.set('searchTerm', nextFilters.searchTerm);
      }
      if (nextFilters.subCategory !== 'all') {
        queryParams.set('subCategory', nextFilters.subCategory);
      }
      const searchQuery = queryParams.toString();
      const res = await fetch(`${API_URL}/api/post/getposts?${searchQuery}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
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
    if (e.target.id === 'searchTerm') {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    }
    if (e.target.id === 'sort') {
      const order = e.target.value || 'desc';
      setSidebarData({ ...sidebarData, sort: order });
    }
    if (e.target.id === 'subCategory') {
      const subCategory = e.target.value || 'all';
      setSidebarData({ ...sidebarData, subCategory });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', sidebarData.searchTerm);
    urlParams.set('sort', sidebarData.sort);
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
      setPosts([...posts, ...data.posts]);
      if (data.posts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    }
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
                  <option value='desc'>Les plus récents</option>
                  <option value='asc'>Les plus anciens</option>
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
