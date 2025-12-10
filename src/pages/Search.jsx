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
    <div className='flex flex-col md:flex-row'>
      <div className='p-7 border-b md:border-r md:min-h-screen border-gray-500'>
        <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
          <div className='flex   items-center gap-2'>
            <label className='whitespace-nowrap font-semibold'>
              Search Term:
            </label>
            <TextInput
              placeholder='Search...'
              id='searchTerm'
              type='text'
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Sort:</label>
            <Select onChange={handleChange} value={sidebarData.sort} id='sort'>
              <option value='desc'>Les plus nouveaux</option>
              <option value='asc'>Les plus anciens</option>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Rubrique:</label>
            <Select onChange={handleChange} value={sidebarData.subCategory} id='subCategory'>
              <option value='all'>Toutes</option>
              <option value='news'>News</option>
              <option value='politique'>Politique</option>
              <option value='science'>Science/Tech</option>
              <option value='sport'>Sport</option>
              <option value='cinema'>Cinéma</option>
            </Select>
          </div>
          <Button type='submit' outline gradientDuoTone='purpleToPink'>
            Appliquer les filtres
                      </Button>
        </form>
      </div>
      <div className='w-full'>
        <h1 className='text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5 '>
          Résultats des posts:
        </h1>
        <div className='p-7 flex flex-wrap gap-4'>
          {!loading && posts.length === 0 && (
            <p className='text-xl text-gray-500'>Posts non trouvés</p>
          )}
          {loading && <p className='text-xl text-gray-500'>En téléchargement...</p>}
          {!loading &&
            posts &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
          {showMore && (
            <button
              onClick={handleShowMore}
              className='text-teal-500 text-lg hover:underline p-7 w-full'
            >
              Voir plus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
