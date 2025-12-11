import AdminSectionHeader from '../../components/admin/AdminSectionHeader';

// CMS: settings module
export default function AdminSettings() {
  return (
    <div className='space-y-6'>
      <AdminSectionHeader title='Paramètres' subtitle='Préparez les réglages éditoriaux et les préférences CMS' />
      <div className='rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300'>
        <p className='font-medium text-slate-800 dark:text-white'>À compléter</p>
        <p className='mt-2 max-w-2xl'>Ajoutez ici les options de configuration (statuts par défaut, workflow éditorial, paramètres SEO) pour transformer l'admin en CMS complet.</p>
      </div>
    </div>
  );
}
