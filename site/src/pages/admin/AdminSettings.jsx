import PageShell from '../../admin/components/PageShell';

export default function AdminSettings() {
  return (
    <PageShell
      title='Paramètres du CMS'
      description='Configuration générale, webhooks, sécurité et branding.'
    >
      <div className='space-y-6'>
        <div className='rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60'>
          <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Branding</h3>
          <p className='text-sm text-slate-600 dark:text-slate-300'>Logo, couleurs, métadonnées sociales.</p>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60'>
          <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>Sécurité & authentification</h3>
          <p className='text-sm text-slate-600 dark:text-slate-300'>Rôles, renouvellement de token, exigences de mot de passe.</p>
        </div>
      </div>
    </PageShell>
  );
}
