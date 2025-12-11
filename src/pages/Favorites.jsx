import { useSelector } from 'react-redux';
import PostCard from '../components/PostCard';
import FavoriteButton from '../components/FavoriteButton';

export default function Favorites() {
  const favorites = useSelector((state) => state.favorites.items);

  return (
    <div className='min-h-screen bg-mist/60 py-10 dark:bg-slate-950'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6 px-4'>
        <header className='flex flex-col gap-2 rounded-2xl bg-white/80 p-6 shadow-subtle ring-1 ring-subtle backdrop-blur dark:bg-slate-900/80 dark:ring-slate-800'>
          <p className='text-xs font-semibold uppercase tracking-[0.25em] text-primary'>Favoris</p>
          <h1 className='text-3xl font-extrabold text-primary'>Vos articles enregistrés</h1>
          <p className='text-slate-600 dark:text-slate-300'>Retrouvez les reportages que vous avez mis de côté.</p>
        </header>

        {favorites.length === 0 ? (
          <div className='rounded-2xl border border-dashed border-subtle bg-white/80 p-6 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200'>
            Aucun favori pour le moment. Ajoutez des articles grâce à l'étoile sur les cartes ou les pages d'article.
          </div>
        ) : (
          <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {favorites.map((post) => (
              <div key={post._id} className='relative'>
                <PostCard post={post} />
                <div className='absolute right-4 top-4'>
                  <FavoriteButton post={post} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
