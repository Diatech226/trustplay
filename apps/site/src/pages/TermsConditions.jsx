import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Seo from '../components/Seo';

export default function TermsConditions() {
  return (
    <main className='bg-mist/60 py-10 dark:bg-slate-950'>
      <Seo
        title="Conditions d'utilisation | Trust Media"
        description="Consultez les conditions générales d'utilisation des services Trust Media."
      />
      <PageContainer className='space-y-6'>
        <PageHeader kicker='Légal' title="Conditions d'utilisation" description='Mise à jour : 31/03/2025' />

        <div className='space-y-6 rounded-2xl bg-white p-6 shadow-subtle ring-1 ring-subtle dark:bg-slate-900 dark:ring-slate-800'>
          <section className='space-y-2'>
            <h2 className='text-2xl font-semibold text-primary'>Acceptation des conditions</h2>
            <p>En accédant au site, vous acceptez les présentes conditions ainsi que les lois applicables.</p>
          </section>

          <section className='space-y-2'>
            <h2 className='text-2xl font-semibold text-primary'>Utilisation des services</h2>
            <p>Les contenus Trust Media sont fournis pour un usage personnel et non commercial, sauf autorisation explicite.</p>
          </section>

          <section className='space-y-2'>
            <h2 className='text-2xl font-semibold text-primary'>Propriété intellectuelle</h2>
            <p>Les marques et contenus sont protégés. Toute reproduction ou diffusion nécessite notre accord écrit.</p>
          </section>

          <section className='space-y-2'>
            <h2 className='text-2xl font-semibold text-primary'>Responsabilités</h2>
            <p>Trust Media ne saurait être tenu responsable en cas d'interruption ou d'erreur involontaire sur le site.</p>
          </section>

          <section className='space-y-2'>
            <h2 className='text-2xl font-semibold text-primary'>Contact</h2>
            <p>Pour toute question, écrivez-nous à <a href='mailto:trust-group@gmail.com' className='font-semibold text-primary underline'>trust-group@gmail.com</a>.</p>
          </section>
        </div>
      </PageContainer>
    </main>
  );
}
