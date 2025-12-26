import { useDispatch, useSelector } from 'react-redux';
import { clearHistory, removeHistoryItem } from '../redux/history/historySlice';
import { Link } from 'react-router-dom';
import { DEFAULT_MEDIA_PLACEHOLDER, resolveMediaUrl } from '../lib/mediaUrls';

export default function History() {
  const history = useSelector((state) => state.history.items);
  const dispatch = useDispatch();

  return (
    <div className='min-h-screen bg-mist/60 py-10 dark:bg-slate-950'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6 px-4'>
        <header className='flex flex-col gap-2 rounded-2xl bg-white/80 p-6 shadow-subtle ring-1 ring-subtle backdrop-blur dark:bg-slate-900/80 dark:ring-slate-800'>
          <p className='text-xs font-semibold uppercase tracking-[0.25em] text-primary'>Historique</p>
          <h1 className='text-3xl font-extrabold text-primary'>Articles consultés</h1>
          <p className='text-slate-600 dark:text-slate-300'>Suivez vos lectures récentes et reprenez là où vous vous êtes arrêté.</p>
          {history.length > 0 && (
            <div className='mt-2'>
              <button
                onClick={() => dispatch(clearHistory())}
                className='rounded-full border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-primary hover:text-white'
              >
                Tout effacer
              </button>
            </div>
          )}
        </header>

        {history.length === 0 ? (
          <div className='rounded-2xl border border-dashed border-subtle bg-white/80 p-6 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200'>
            Aucun article consulté pour le moment.
          </div>
        ) : (
          <div className='space-y-4'>
            {history.map((item) => (
              <div key={item._id} className='flex flex-col gap-2 rounded-2xl bg-white/80 p-4 shadow-subtle ring-1 ring-subtle backdrop-blur dark:bg-slate-900/80 dark:ring-slate-800 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-4'>
                    <img
                      src={resolveMediaUrl(
                        item.imageThumb || item.imageCover || item.imageOriginal || item.image,
                        DEFAULT_MEDIA_PLACEHOLDER
                      )}
                    alt={item.title}
                    loading='lazy'
                    decoding='async'
                    width='64'
                    height='64'
                    className='h-16 w-16 rounded-xl object-cover'
                  />
                  <div className='space-y-1'>
                    <Link to={`/post/${item.slug}`} className='text-lg font-semibold text-primary hover:underline'>
                      {item.title}
                    </Link>
                    <p className='text-xs text-slate-600 dark:text-slate-300'>Consulté le {new Date(item.viewedAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Link
                    to={`/post/${item.slug}`}
                    className='rounded-full border border-primary/40 px-3 py-2 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-primary hover:text-white'
                  >
                    Reprendre la lecture
                  </Link>
                  <button
                    onClick={() => dispatch(removeHistoryItem(item._id))}
                    className='rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-500 transition hover:-translate-y-0.5 hover:bg-red-100 dark:bg-red-500/10'
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
