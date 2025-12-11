"use client";


// migrated from Vite React route to Next.js app router
import CategoryPageLayout from '@/components/CategoryPageLayout';

export default function CinemaPage() {
  return (
    <CategoryPageLayout
      title='Cinéma'
      subCategory='cinema'
      path='/cinema'
      description='Critiques, sorties et coulisses du grand écran.'
    />
  );
}
