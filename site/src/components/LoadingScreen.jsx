import { Spinner } from 'flowbite-react';
import PageContainer from './layout/PageContainer';

export default function LoadingScreen({ label = 'Chargement...' }) {
  return (
    <main className='flex min-h-[50vh] items-center bg-white/60 py-12 dark:bg-slate-950'>
      <PageContainer className='flex justify-center'>
        <div className='flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-subtle ring-1 ring-subtle dark:bg-slate-900 dark:ring-slate-800'>
          <Spinner />
          <span className='text-sm font-semibold text-primary'>{label}</span>
        </div>
      </PageContainer>
    </main>
  );
}
