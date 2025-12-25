import { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ProjectsGallery from '../components/ProjectsGallery';
import ServicesSection from '../components/ServicesSection';
import ContactSection from '../components/ContactSection';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import PostCard from '../components/PostCard';
import PostCardSkeleton from '../components/skeletons/PostCardSkeleton';
import Seo from '../components/Seo';
import { getProductionPosts, normalizePosts } from '../services/posts.service';

const TrustProdPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductionPosts = async () => {
      try {
        setLoading(true);
        setError('');
        const { posts: fetchedPosts } = await getProductionPosts({ order: 'desc', limit: 12 });
        setPosts(normalizePosts(fetchedPosts));
      } catch (err) {
        setError('Impossible de charger les productions pour le moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductionPosts();
  }, []);

  return (
    <>
      <Seo
        title='TrustProd - Production Audiovisuelle'
        description='Découvrez les services TrustProd : production audiovisuelle, tournage, montage et accompagnement créatif.'
      />
      <HeroSection />
      <AboutSection />
      <ProjectsGallery />
      <ServicesSection />
      <section className='bg-mist/60 py-12 dark:bg-slate-950'>
        <PageContainer className='space-y-6'>
          <PageHeader
            kicker='Production'
            title='Trust Production'
            description="Retrouvez les dernières productions et projets en cours de l'équipe Trust Prod."
          />
          {error && (
            <p className='rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800'>
              {error}
            </p>
          )}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {loading &&
              Array.from({ length: 6 }).map((_, index) => <PostCardSkeleton key={`production-${index}`} />)}
            {!loading && !error && posts.length === 0 && (
              <p className='col-span-full rounded-xl border border-dashed border-subtle bg-white/80 p-6 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200'>
                Aucune production disponible pour le moment.
              </p>
            )}
            {!loading && !error && posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        </PageContainer>
      </section>
      <ContactSection />

    </>
  );
};

export default TrustProdPage;
