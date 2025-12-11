// CMS: shared admin header
export default function AdminSectionHeader({ title, subtitle, action }) {
  return (
    <div className='mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800'>
      <div>
        <p className='text-xs uppercase tracking-[0.25em] text-slate-500'>Module</p>
        <h2 className='text-2xl font-semibold text-slate-900 dark:text-white'>{title}</h2>
        {subtitle && <p className='text-sm text-slate-500 dark:text-slate-400'>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
