import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <main className='min-h-screen bg-mist/60 py-16 dark:bg-slate-950'>
      <Seo title='Page introuvable | Trust Media' description='La page demandée est introuvable.' />
      <PageContainer className='flex flex-col items-center gap-6 text-center'>
        <span className='rounded-full bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent'>
          404
        </span>
        <h1 className='text-3xl font-extrabold text-primary'>Page introuvable</h1>
        <p className='max-w-xl text-slate-600 dark:text-slate-300'>
          Oups ! La page que vous cherchez n&apos;existe pas ou a été déplacée. Revenez à l&apos;accueil ou explorez les
          rubriques principales.
        </p>
        <div className='flex flex-wrap justify-center gap-3'>
          <Link to='/' className='rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-card'>
            Retour à l&apos;accueil
          </Link>
          <Link to='/news' className='rounded-full border border-subtle px-5 py-2 text-sm font-semibold text-primary'>
            Lire les news
          </Link>
        </div>
      </PageContainer>
    </main>
  );
}
