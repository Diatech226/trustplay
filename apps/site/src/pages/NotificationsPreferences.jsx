import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCategories, toggleSubscription } from '../redux/notifications/notificationsSlice';
import { useRubrics } from '../hooks/useRubrics';

export default function NotificationsPreferences() {
  const dispatch = useDispatch();
  const { categories, subscribed } = useSelector((state) => state.notifications);
  const { rubrics } = useRubrics('TrustMedia');

  useEffect(() => {
    if (rubrics.length) {
      dispatch(setCategories(rubrics.map((rubric) => rubric.slug)));
    }
  }, [dispatch, rubrics]);

  const handleToggle = (cat) => dispatch(toggleSubscription(cat));

  return (
    <div className='min-h-screen bg-mist/60 py-10 dark:bg-slate-950'>
      <div className='mx-auto flex max-w-5xl flex-col gap-6 px-4'>
        <header className='flex flex-col gap-2 rounded-2xl bg-white/80 p-6 shadow-subtle ring-1 ring-subtle backdrop-blur dark:bg-slate-900/80 dark:ring-slate-800'>
          <p className='text-xs font-semibold uppercase tracking-[0.25em] text-primary'>Notifications</p>
          <h1 className='text-3xl font-extrabold text-primary'>Rubriques suivies</h1>
          <p className='text-slate-600 dark:text-slate-300'>Choisissez les thématiques pour lesquelles vous souhaitez être alerté.</p>
        </header>

        <div className='grid gap-4 md:grid-cols-2'>
          {categories.map((cat) => {
            const active = subscribed.includes(cat);
            const rubricLabel = rubrics.find((rubric) => rubric.slug === cat)?.label || cat;
            return (
              <button
                key={cat}
                onClick={() => handleToggle(cat)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-card ${
                  active ? 'border-primary bg-primary/10 text-primary' : 'border-subtle bg-white/80 dark:bg-slate-900/80'
                }`}
              >
                <div>
                  <p className='text-lg font-semibold'>{rubricLabel}</p>
                  <p className='text-sm text-slate-600 dark:text-slate-300'>Recevoir une alerte à chaque nouvel article.</p>
                </div>
                <span className={`h-4 w-4 rounded-full border ${active ? 'bg-primary' : 'border-slate-400'}`}></span>
              </button>
            );
          })}
        </div>
        <div className='rounded-2xl bg-white/80 p-4 text-sm text-slate-600 shadow-subtle ring-1 ring-subtle dark:bg-slate-900/80 dark:text-slate-300 dark:ring-slate-800'>
          Bonus : une pastille rouge pourra apparaître dans le header lorsqu'un nouvel article sort dans vos rubriques préférées.
        </div>
      </div>
    </div>
  );
}
