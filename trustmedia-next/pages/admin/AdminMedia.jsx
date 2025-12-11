"use client";


// migrated from Vite React route to Next.js app router
import { Button } from 'flowbite-react';
import AdminSectionHeader from '../@/components/admin/AdminSectionHeader';

// CMS: media manager
export default function AdminMedia() {
  return (
    <div className='space-y-6'>
      <AdminSectionHeader
        title='Médias'
        subtitle='Centralisez vos images depuis le backend MongoDB'
        action={<Button color='light'>Uploader un média</Button>}
      />
      <div className='rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300'>
        <p className='font-medium text-slate-800 dark:text-white'>Gestionnaire à venir</p>
        <p className='mt-2 max-w-2xl'>Préparez la future intégration : liste paginée des images stockées via l'API upload, sélection et réutilisation directe dans les formulaires d'articles.</p>
      </div>
    </div>
  );
}
