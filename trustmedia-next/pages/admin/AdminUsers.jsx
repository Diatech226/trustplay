"use client";


// migrated from Vite React route to Next.js app router
import AdminSectionHeader from '../@/components/admin/AdminSectionHeader';

// CMS: users module
export default function AdminUsers() {
  return (
    <div className='space-y-6'>
      <AdminSectionHeader
        title='Utilisateurs'
        subtitle="Préparez les rôles (admin, auteur, lecteur) et le contrôle d'accès"
      />
      <div className='rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300'>
        <p className='font-medium text-slate-800 dark:text-white'>Structure en attente</p>
        <p className='mt-2 max-w-2xl'>Ajoutez ici la table des utilisateurs dès que l'API sera disponible. Inclure les filtres par rôle et actions de modification.</p>
      </div>
    </div>
  );
}
