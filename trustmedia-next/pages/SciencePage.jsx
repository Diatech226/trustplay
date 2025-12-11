"use client";


// migrated from Vite React route to Next.js app router
import CategoryPageLayout from '@/components/CategoryPageLayout';

export default function SciencePage() {
  return (
    <CategoryPageLayout
      title='Science & Tech'
      subCategory='science'
      path='/science'
      description='Innovations, découvertes et nouvelles technologies.'
    />
  );
}
