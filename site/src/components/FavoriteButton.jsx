import { FaRegStar, FaStar } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../redux/favorites/favoritesSlice';

export default function FavoriteButton({ post, className = '' }) {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);
  const isFavorite = favorites.some((item) => item._id === post?._id);

  const handleToggle = (e) => {
    e.preventDefault();
    if (!post) return;
    dispatch(toggleFavorite(post));
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 rounded-full border border-primary/40 bg-white/80 px-3 py-2 text-sm font-semibold text-primary shadow-subtle transition hover:-translate-y-0.5 hover:bg-primary hover:text-white dark:bg-slate-900/80 ${className}`}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isFavorite ? <FaStar className='text-yellow-400' /> : <FaRegStar />}
      <span className='hidden sm:inline'>{isFavorite ? 'Favori' : 'Ajouter aux favoris'}</span>
    </button>
  );
}
