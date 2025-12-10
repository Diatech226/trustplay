/*import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import axios from 'axios';
export default function Home() {
  const [posts, setPosts] = useState([]);

const apiUrl = 'https://trustapi-ten.vercel.app';  // L'URL de ton backend

axios.get(`${apiUrl}/api/some-endpoint`)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/post/getPosts');
      const data = await res.json();
      setPosts(data.posts);
    };
    fetchPosts();
  }, []);
  return (
    <div>
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto '>
        <h1 className='text-3xl font-bold lg:text-6xl'>Trust Media </h1>
        <p className='text-gray-500 text-xs sm:text-sm'>
        Trust est un complexe dédié aux médias, à l'événementiel et à la production audiovisuelle.
        </p>
        <Link
          to='/search'
          className='text-xs sm:text-sm text-teal-500 font-bold hover:underline'
        >
          Voir tous les posts
        </Link>
      </div>
      <div className='p-6 bg-amber-100 dark:bg-slate-700 flex justify-center'>
        <CallToAction />
      </div>

      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7'>
        {posts && posts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold text-center'>Post Récent</h2>
            <div className='flex flex-wrap gap-4'>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link
              to={'/search'}
              className='text-lg text-teal-500 hover:underline text-center'
            >
              Vois tous les posts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
*/import { useEffect, useState, useMemo } from 'react';
import CallToAction from '../components/CallToAction';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const API_URL = import.meta.env.VITE_API_URL;

  const categories = [
    { name: 'Tous', key: 'all' },
    { name: 'News', key: 'news' },
    { name: 'politique', key: 'politique' },
    { name: 'Economie', key: 'economie' },
    { name: 'Culture', key: 'culture' },
    { name: 'Technologie', key: 'technologie' },
    { name: 'Sport', key: 'sport' },
    { name: 'Portraits', key: 'portraits' },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/post/getPosts`)
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des posts');
        }
        const data = await res.json();
        console.log("Posts récupérés :", data.posts); // 🔍 Vérifier la structure ici
        setPosts(data.posts || []);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);
  

  // Optimisation : Utilisation de `useMemo` pour éviter le recalcul inutile
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return posts;
    return posts.filter((post) => post.subCategory === selectedCategory);
  }, [selectedCategory, posts]);

  return (
    <div>
      {/* 🔷 Header */}
      <div className='flex flex-col gap-6 p-16 px-3 max-w-6xl mx-auto text-center'>
        <h1 className='text-4xl font-extrabold lg:text-6xl text-teal-600'>Trust Media</h1>
        <p className='text-gray-600 text-sm sm:text-lg'>
          Trust est un complexe dédié aux médias, à l'événementiel et à la production audiovisuelle.
        </p>
      </div>

      {/* 🔷 Barre de navigation pour filtrer les posts par catégorie */}
      <div className='flex justify-center gap-2 sm:gap-4 py-4 bg-gray-100 dark:bg-slate-800 flex-wrap'>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`text-sm sm:text-lg font-semibold px-3 py-2 rounded-md transition-all ${
              selectedCategory === cat.key ? 'bg-teal-500 text-white shadow-md' : 'text-teal-500 hover:bg-teal-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 🔷 Affichage des posts filtrés */}
      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-12 py-7'>
        {loading ? (
          <p className='text-center text-gray-500 text-lg font-semibold'>Chargement des posts...</p>
        ) : filteredPosts.length > 0 ? (
          <div className='flex flex-wrap gap-4 justify-center'>
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className='text-center text-gray-500 text-lg'>Aucun post trouvé pour cette catégorie.</p>
        )}
      </div>

      {/* 🔷 Call to Action */}
      <div className='p-6 bg-amber-100 dark:bg-slate-700 flex justify-center'>
        <CallToAction />
      </div>
    </div>
  );
}
