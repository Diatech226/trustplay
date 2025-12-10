import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
    { name: 'Politique', key: 'politique' },
    { name: 'Science/Tech', key: 'science' },
    { name: 'Sport', key: 'sport' },
    { name: 'Cinéma', key: 'cinema' },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/post/getposts`);
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des posts');
        }
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [API_URL]);
  

  // Optimisation : Utilisation de `useMemo` pour éviter le recalcul inutile
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return posts;
    return posts.filter((post) => post.subCategory === selectedCategory);
  }, [selectedCategory, posts]);

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1, 5);
  const gridPosts = filteredPosts.slice(0, 9);

  return (
    <div>
      {/* new layout for home sections */}
      <section className='relative overflow-hidden bg-gradient-to-br from-mist via-white to-subtle dark:from-slate-900 dark:via-slate-950 dark:to-slate-900'>
        <div className='mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-12 pt-12 lg:flex-row lg:items-end lg:pb-16'>
          <div className='flex-1 space-y-4'>
            <p className='text-sm font-semibold uppercase tracking-[0.3em] text-primary'>À la une</p>
            <h1 className='text-4xl font-extrabold leading-tight text-primary lg:text-5xl'>
              Trust Media, votre regard sur l'actualité.
            </h1>
            <p className='max-w-2xl text-lg text-slate-600 dark:text-slate-200'>
              Une rédaction engagée qui met en avant les rubriques phares : News, Politique, Science/Tech, Sport et Cinéma.
            </p>
            <div className='flex flex-wrap gap-3'>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === cat.key
                      ? 'bg-primary text-white shadow-card'
                      : 'bg-white text-primary ring-1 ring-subtle hover:bg-subtle'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          {featuredPost && (
            <Link
              to={`/post/${featuredPost.slug}`}
              className='group relative flex w-full max-w-xl overflow-hidden rounded-2xl border border-subtle bg-white shadow-card transition hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900'
            >
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className='h-64 w-2/3 object-cover transition duration-500 group-hover:scale-105'
              />
              <div className='flex flex-1 flex-col gap-3 p-6'>
                <span className='self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent'>Dernière heure</span>
                <h2 className='text-xl font-bold leading-tight text-primary dark:text-white'>
                  {featuredPost.title}
                </h2>
                <p className='text-sm text-slate-600 line-clamp-3 dark:text-slate-300'>
                  {featuredPost?.content?.replace(/<[^>]+>/g, '').slice(0, 180)}...
                </p>
                <span className='text-sm font-semibold text-primary'>Lire l'article →</span>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className='mx-auto mt-10 max-w-6xl px-4'>
        <div className='flex items-center justify-between gap-4 pb-4'>
          <h2 className='text-2xl font-bold text-primary'>Dernières actualités</h2>
          <Link to='/search' className='text-sm font-semibold text-ocean hover:underline'>Voir toutes les publications</Link>
        </div>
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {loading && <p className='text-slate-500'>Chargement des posts...</p>}
          {!loading && latestPosts.length === 0 && <p className='text-slate-500'>Aucune actualité pour le moment.</p>}
          {!loading &&
            latestPosts.map((post) => (
              <div
                key={post._id}
                className='flex h-full flex-col gap-3 rounded-2xl border border-subtle bg-white p-4 shadow-subtle transition hover:-translate-y-1 hover:shadow-card dark:border-slate-800 dark:bg-slate-900'
              >
                <Link to={`/post/${post.slug}`} className='flex items-start gap-3'>
                  <div className='h-20 w-24 overflow-hidden rounded-xl'>
                    <img src={post.image} alt={post.title} className='h-full w-full object-cover' />
                  </div>
                  <div className='space-y-2'>
                    <p className='text-xs uppercase tracking-wide text-primary'>{post.subCategory}</p>
                    <h3 className='text-base font-semibold leading-snug text-slate-900 line-clamp-2 dark:text-white'>
                      {post.title}
                    </h3>
                    <p className='text-xs text-slate-500'>
                      {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
        </div>
      </section>

      <section className='mx-auto mt-14 max-w-6xl px-4'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.2em] text-primary'>Sélection de la rédaction</p>
            <h2 className='text-3xl font-extrabold text-primary'>Les incontournables du jour</h2>
            <p className='text-slate-600 dark:text-slate-300'>Une sélection équilibrée entre les rubriques phares.</p>
          </div>
          <Link to='/search' className='text-sm font-semibold text-ocean hover:underline'>Explorer les rubriques</Link>
        </div>
        <div className='mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {!loading && gridPosts.length === 0 && (
            <p className='col-span-full text-slate-500'>Aucun post trouvé pour cette catégorie.</p>
          )}
          {loading && <p className='text-slate-500'>Chargement des posts...</p>}
          {!loading && gridPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </section>

      {/* Call to Action */}
      <div className='mt-16 bg-gradient-to-r from-secondary/10 via-accent/10 to-ocean/10 py-10'>
        <div className='mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 px-4 text-center'>
          <CallToAction />
        </div>
      </div>
    </div>
  );
}
