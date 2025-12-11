"use client";


// migrated from Vite React route to Next.js app router
import AdminSectionHeader from '../@/components/admin/AdminSectionHeader';

// CMS: comments moderation
export default function AdminComments() {
  return (
    <div className='space-y-6'>
      <AdminSectionHeader
        title='Commentaires'
        subtitle='Modérez, approuvez ou masquez les contributions des lecteurs'
      />
      <div className='rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300'>
        <p className='font-medium text-slate-800 dark:text-white'>Modération prête</p>
        <p className='mt-2 max-w-2xl'>Structure front prête pour connecter l'API : filtres par article, statut, date, actions de suppression ou approbation.</p>
      </div>
    </div>
  );
}
