export default function KpiCard({ label, value, trend, helper }) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70'>
      <p className='text-sm font-semibold text-slate-600 dark:text-slate-300'>{label}</p>
      <p className='mt-2 text-3xl font-bold text-slate-900 dark:text-white'>{value}</p>
      <div className='mt-1 text-xs text-slate-500 dark:text-slate-400'>{helper}</div>
      {trend && (
        <div className={`mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${trend > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'}`}>
          {trend > 0 ? '+' : ''}{trend}% cette semaine
        </div>
      )}
    </div>
  );
}
