import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Seo from '../components/Seo';

export default function PrivacyPolicy() {
  return (
    <main className='bg-mist/60 py-10 dark:bg-slate-950'>
      <Seo
        title='Politique de confidentialité | Trust Media'
        description='Consultez la politique de confidentialité de Trust Media : collecte, utilisation et protection des données.'
      />
      <PageContainer className='space-y-6'>
        <PageHeader
          kicker='Légal'
          title='Politique de confidentialité'
          description="Date d'effet : 31/03/2025"
        />

        <div className='space-y-6 rounded-2xl bg-white p-6 shadow-subtle ring-1 ring-subtle dark:bg-slate-900 dark:ring-slate-800'>
          <section className='space-y-2'>
            <h2 className='text-2xl font-semibold text-primary'>1. Collecte des Informations</h2>
            <p>Nous collectons des informations personnelles (nom, email, téléphone) ainsi que des données d'utilisation (adresse IP, cookies).</p>
          </section>

          <section className='space-y-2'>
            <h2 className='text-2xl font-semibold text-primary'>2. Utilisation des Données</h2>
            <p>Vos informations servent à améliorer nos services, envoyer des mises à jour et renforcer la sécurité de notre plateforme.</p>
          </section>

          <section className='space-y-2'>
            <h2 className='text-2xl font-semibold text-primary'>3. Protection des Données</h2>
            <p>Nous appliquons des mesures de sécurité adaptées et ne partageons vos données avec des tiers qu'en cas d'obligation légale.</p>
          </section>

          <section className='space-y-2'>
            <h2 className='text-2xl font-semibold text-primary'>4. Cookies</h2>
            <p>Les cookies améliorent votre expérience. Vous pouvez les désactiver dans les paramètres de votre navigateur.</p>
          </section>

          <section className='space-y-2'>
            <h2 className='text-2xl font-semibold text-primary'>5. Contact</h2>
            <p>
              Pour toute question, contactez-nous à
              <a href='mailto:trust-group@gmail.com' className='pl-1 font-semibold text-primary underline'>trust-group@gmail.com</a>.
            </p>
          </section>
        </div>
      </PageContainer>
    </main>
  );
}
