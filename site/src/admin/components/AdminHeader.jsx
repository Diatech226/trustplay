import { useMemo } from 'react';
import { HiBell, HiMoon, HiSearch, HiSun, HiUserCircle } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';

export default function AdminHeader({ user, onThemeToggle, darkMode = false }) {
  const location = useLocation();
  const pathLabel = useMemo(() => {
    const segments = location.pathname.replace('/dashboard', '').split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    return segments.map((s) => s[0]?.toUpperCase() + s.slice(1)).join(' / ');
  }, [location.pathname]);

  return (
    <header className='flex items-center justify-between gap-4 border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70'>
      <div className='space-y-1'>
        <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>Admin Center</p>
        <h2 className='text-xl font-semibold text-slate-900 dark:text-white'>{pathLabel}</h2>
      </div>
      <div className='flex flex-1 items-center justify-end gap-3'>
        <div className='relative hidden max-w-md flex-1 items-center md:flex'>
          <HiSearch className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400' />
          <input
            type='search'
            placeholder='Rechercher un contenu, un client, une campagne...'
            className='w-full rounded-full border border-slate-200 bg-white px-10 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
          />
        </div>
        <button
          type='button'
          className='hidden rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex'
        >
          Nouvelle fiche
        </button>
        <button
          type='button'
          className='relative rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
        >
          <HiBell className='h-5 w-5' />
          <span className='absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary' />
        </button>
        <button
          type='button'
          onClick={onThemeToggle}
          className='rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
        >
          {darkMode ? <HiSun className='h-5 w-5' /> : <HiMoon className='h-5 w-5' />}
          <span className='sr-only'>Basculer le thème</span>
        </button>
        <div className='flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200'>
          <HiUserCircle className='h-7 w-7' />
          <div className='leading-tight'>
            <p className='font-semibold'>{user?.username || 'Admin'}</p>
            <p className='text-[10px] uppercase tracking-[0.3em] text-slate-500'>{user?.role || 'Role'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
