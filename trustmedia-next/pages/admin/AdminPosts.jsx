"use client";


// migrated from Vite React route to Next.js app router
import { useState } from 'react';
import { Button, Label, Select, TextInput } from 'flowbite-react';
import { Link } from 'react-router-dom';
import DashPosts from '../@/components/DashPosts';
import AdminSectionHeader from '../@/components/admin/AdminSectionHeader';

// CMS: posts module
const categories = ['TrustMedia', 'TrustEvent', 'TrustProduction'];
const subCategories = ['news', 'politique', 'economie', 'culture', 'technologie', 'sport', 'portraits'];

export default function AdminPosts() {
  const [filters, setFilters] = useState({
    category: 'all',
    subCategory: 'all',
    status: 'all',
    query: '',
  });

  const handleChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className='space-y-6'>
      <AdminSectionHeader
        title='Articles'
        subtitle='Gérez les brouillons, publications et archives'
        action={
          <Link to='/dashboard/posts/create'>
            <Button gradientDuoTone='purpleToBlue'>Nouvel article</Button>
          </Link>
        }
      />

      <div className='grid gap-4 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 md:grid-cols-4'>
        <div className='space-y-2'>
          <Label htmlFor='category'>Catégorie</Label>
          <Select id='category' value={filters.category} onChange={handleChange('category')}>
            <option value='all'>Toutes</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='subCategory'>Sous-catégorie</Label>
          <Select id='subCategory' value={filters.subCategory} onChange={handleChange('subCategory')}>
            <option value='all'>Toutes</option>
            {subCategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='status'>Statut</Label>
          <Select id='status' value={filters.status} onChange={handleChange('status')}>
            <option value='all'>Tous</option>
            <option value='draft'>Brouillon</option>
            <option value='published'>Publié</option>
            <option value='archived'>Archivé</option>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='query'>Recherche</Label>
          <TextInput
            id='query'
            placeholder='Titre, auteur...'
            value={filters.query}
            onChange={handleChange('query')}
          />
        </div>
      </div>

      <div className='rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50'>
        <DashPosts filters={filters} />
      </div>
    </div>
  );
}
