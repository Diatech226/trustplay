"use client";


// migrated from Vite React route to Next.js app router
import CategoryPageLayout from '@/components/CategoryPageLayout';

export default function PoliticsPage() {
  return (
    <CategoryPageLayout
      title='Politique'
      subCategory='politique'
      path='/politique'
      description='Décryptages, interviews et analyses de la scène politique.'
    />
  );
}
