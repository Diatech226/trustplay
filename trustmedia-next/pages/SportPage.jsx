"use client";


// migrated from Vite React route to Next.js app router
import CategoryPageLayout from '@/components/CategoryPageLayout';

export default function SportPage() {
  return (
    <CategoryPageLayout
      title='Sport'
      subCategory='sport'
      path='/sport'
      description='Résultats, portraits et analyses du monde sportif.'
    />
  );
}
