export default function ArticleHeroSkeleton() {
  return (
    <div className='grid gap-0 overflow-hidden rounded-3xl border border-subtle bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-5'>
      <div className='h-72 w-full bg-subtle dark:bg-slate-800 lg:col-span-3' />
      <div className='flex flex-col gap-4 p-6 lg:col-span-2'>
        <div className='h-4 w-24 rounded-full bg-subtle dark:bg-slate-800' />
        <div className='h-6 w-5/6 rounded-full bg-subtle dark:bg-slate-800' />
        <div className='h-6 w-2/3 rounded-full bg-subtle dark:bg-slate-800' />
        <div className='h-4 w-1/2 rounded-full bg-subtle dark:bg-slate-800' />
        <div className='h-4 w-3/4 rounded-full bg-subtle dark:bg-slate-800' />
      </div>
    </div>
  );
}
