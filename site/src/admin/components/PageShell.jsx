import Breadcrumbs from './Breadcrumbs';

export default function PageShell({ title, description, actions, children }) {
  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <Breadcrumbs />
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>{title}</h1>
            {description && <p className='text-sm text-slate-600 dark:text-slate-300'>{description}</p>}
          </div>
          {actions && <div className='flex items-center gap-2'>{actions}</div>}
        </div>
      </div>
      <div className='rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70'>
        {children}
      </div>
    </div>
  );
}
