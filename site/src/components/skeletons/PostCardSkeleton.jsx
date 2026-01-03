export default function PostCardSkeleton() {
  return (
    <div className='animate-pulse overflow-hidden rounded-2xl border border-subtle bg-white shadow-subtle dark:border-slate-800 dark:bg-slate-900'>
      <div className='h-56 w-full bg-subtle dark:bg-slate-800' />
      <div className='space-y-3 px-5 py-4'>
        <div className='flex items-center justify-between text-xs text-slate-500'>
          <div className='h-3 w-20 rounded-full bg-subtle dark:bg-slate-800' />
          <div className='h-3 w-14 rounded-full bg-subtle dark:bg-slate-800' />
        </div>
        <div className='h-4 w-11/12 rounded-full bg-subtle dark:bg-slate-800' />
        <div className='h-4 w-2/3 rounded-full bg-subtle dark:bg-slate-800' />
        <div className='flex items-center justify-between pt-2'>
          <div className='h-3 w-20 rounded-full bg-subtle dark:bg-slate-800' />
          <div className='h-6 w-12 rounded-full bg-subtle dark:bg-slate-800' />
        </div>
      </div>
    </div>
  );
}
