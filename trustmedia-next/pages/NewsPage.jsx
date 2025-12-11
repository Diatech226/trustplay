"use client";


// migrated from Vite React route to Next.js app router
import CategoryPageLayout from '@/components/CategoryPageLayout';

export default function NewsPage() {
  return (
    <CategoryPageLayout
      title='News'
      subCategory='news'
      path='/news'
      description='Toutes les actualités de Trust Media au même endroit.'
    />
  );
}
