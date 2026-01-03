export default function PageHeader({ kicker, title, description, action }) {
  return (
    <header className='flex flex-col gap-3 rounded-2xl bg-white/90 p-6 shadow-subtle ring-1 ring-subtle backdrop-blur dark:bg-slate-900/90 dark:ring-slate-800'>
      {kicker && <p className='text-xs font-semibold uppercase tracking-[0.25em] text-primary'>{kicker}</p>}
      {title && <h1 className='text-3xl font-extrabold text-primary dark:text-white'>{title}</h1>}
      {description && <p className='text-slate-600 dark:text-slate-300'>{description}</p>}
      {action && <div className='mt-2'>{action}</div>}
    </header>
  );
}
