import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import PageContainer from '../components/layout/PageContainer';
import PostCard from '../components/PostCard';
import PostCardSkeleton from '../components/skeletons/PostCardSkeleton';
import { ResponsiveImage } from '../components/ResponsiveImage';
import Seo from '../components/Seo';
import { getMediaPosts, normalizePosts } from '../services/posts.service';
import { useRubrics } from '../hooks/useRubrics';
import { DEFAULT_MEDIA_PLACEHOLDER } from '../lib/mediaUrls';
import { MEDIA_CATEGORY, normalizeSubCategory } from '../utils/categories';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [sectionPosts, setSectionPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { rubrics: trustMediaRubrics, rubricMap } = useRubrics('TrustMedia');

  const categories = [
    { name: 'Tous', key: 'all' },
    ...trustMediaRubrics.map((cat) => ({
      name: cat.label,
      key: cat.slug,
    })),
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError('');
        const latestResponse = await getMediaPosts({ order: 'desc', limit: 40 });
        const normalizedPosts = normalizePosts(latestResponse.posts).filter(
          (post) => !post.category || post.category === MEDIA_CATEGORY
        );
        const nextSections = trustMediaRubrics.reduce((acc, cat) => {
          const items = normalizedPosts.filter(
            (post) => normalizeSubCategory(post.subCategory) === cat.slug
          );
          acc[cat.slug] = items.slice(0, 4);
          return acc;
        }, {});
        setPosts(normalizedPosts);
        setSectionPosts(nextSections);
      } catch (error) {
        setError('Erreur lors du chargement des posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [trustMediaRubrics]);

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1, 5);
  const featuredPosts = posts.slice(0, 9);
  const heroDescription = featuredPost?.content?.replace(/<[^>]+>/g, '').slice(0, 160) ||
    "Une rédaction engagée qui met en avant les rubriques phares : News, Politique, Science/Tech, Sport et Cinéma.";
  const baseLinkClass = 'text-sm font-semibold text-ocean hover:underline';
  const buildSearchUrl = (params = {}) => {
    const urlParams = new URLSearchParams({ category: MEDIA_CATEGORY, ...params });
    return `/search?${urlParams.toString()}`;
  };
  const allPublicationsUrl = buildSearchUrl();
  const featuredUrl = buildSearchUrl({ sort: 'recent', dateRange: '24h' });
  const allRubriquesUrl = '/rubriques';

  return (
    <main className='bg-mist/60 dark:bg-slate-950'>
      <Seo title='Trust Media | Actualités et analyses' description={heroDescription} />

      <section className='relative overflow-hidden bg-gradient-to-br from-mist via-white to-subtle dark:from-slate-900 dark:via-slate-950 dark:to-slate-900'>
        <PageContainer className='flex flex-col gap-10 pb-12 pt-12 lg:flex-row lg:items-end lg:pb-16'>
          <div className='flex-1 space-y-4'>
            <p className='text-sm font-semibold uppercase tracking-[0.3em] text-primary'>À la une</p>
            <h1 className='text-4xl font-extrabold leading-tight text-primary lg:text-5xl'>
              Trust Media, votre regard sur l&apos;actualité.
            </h1>
            <p className='max-w-2xl text-lg text-slate-600 dark:text-slate-200'>
              {heroDescription}
            </p>
            <div className='flex flex-wrap gap-3'>
              {categories.map((cat) => (
                <Link
                  key={cat.key}
                  to={cat.key === 'all' ? allPublicationsUrl : buildSearchUrl({ subCategory: cat.key })}
                  className='rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary ring-1 ring-subtle transition hover:bg-subtle dark:bg-slate-900 dark:text-white dark:ring-slate-800'
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          {featuredPost && (
            <Link
              to={`/post/${featuredPost.slug}`}
              className='group relative flex w-full max-w-xl overflow-hidden rounded-2xl border border-subtle bg-white shadow-card transition hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900'
            >
              <ResponsiveImage
                media={featuredPost.featuredMedia}
                fallbackUrl={
                  featuredPost.imageLegacy ||
                  featuredPost.imageCover ||
                  featuredPost.imageOriginal ||
                  featuredPost.image ||
                  DEFAULT_MEDIA_PLACEHOLDER
                }
                alt={featuredPost.title}
                variantPreference="cover"
                sizes="(max-width: 768px) 100vw, 720px"
                className="h-64 w-2/3 object-cover transition duration-500 group-hover:scale-105"
              />
              <div className='flex flex-1 flex-col gap-3 p-6'>
                <span className='self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent'>Dernière heure</span>
                <h2 className='text-xl font-bold leading-tight text-primary dark:text-white'>
                  {featuredPost.title}
                </h2>
                <p className='text-sm text-slate-600 line-clamp-3 dark:text-slate-300'>
                  {heroDescription}
                </p>
                <span className='text-sm font-semibold text-primary'>Lire l&apos;article →</span>
              </div>
            </Link>
          )}
        </PageContainer>
        {!loading && error && (
          <PageContainer>
            <div className='rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-100'>
              {error}
            </div>
          </PageContainer>
        )}
        {!loading && !error && posts.length === 0 && (
          <PageContainer>
            <div className='rounded-2xl border border-dashed border-subtle bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200'>
              Aucun article Trust Media disponible pour le moment.
            </div>
          </PageContainer>
        )}
      </section>

      <PageContainer className='space-y-10 py-10'>
        <section>
          <div className='flex items-center justify-between gap-4 pb-4'>
            <h2 className='text-2xl font-bold text-primary'>Dernières actualités</h2>
            <Link to={allPublicationsUrl} className={baseLinkClass}>Voir toutes les publications</Link>
          </div>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {loading && Array.from({ length: 4 }).map((_, index) => <PostCardSkeleton key={`latest-${index}`} />)}
            {error && !loading && (
              <p className='col-span-full rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800'>
                {error}
              </p>
            )}
            {!loading && !error && latestPosts.length === 0 && <p className='text-slate-500'>Aucune actualité pour le moment.</p>}
            {!loading && !error &&
              latestPosts.map((post) => (
                <div
                  key={post._id}
                  className='flex h-full flex-col gap-3 rounded-2xl border border-subtle bg-white p-4 shadow-subtle transition hover:-translate-y-1 hover:shadow-card dark:border-slate-800 dark:bg-slate-900'
                >
                  <Link to={`/post/${post.slug}`} className='flex items-start gap-3'>
                    <div className='h-20 w-24 overflow-hidden rounded-xl'>
                      <ResponsiveImage
                        media={post.featuredMedia}
                        fallbackUrl={
                          post.imageLegacy ||
                          post.imageThumb ||
                          post.imageMedium ||
                          post.imageCover ||
                          post.imageOriginal ||
                          post.image ||
                          DEFAULT_MEDIA_PLACEHOLDER
                        }
                        alt={post.title}
                        variantPreference="thumb"
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className='space-y-2'>
                      <p className='text-xs uppercase tracking-wide text-primary'>
                        {rubricMap[normalizeSubCategory(post.subCategory)]?.label || post.subCategory}
                      </p>
                      <h3 className='text-base font-semibold leading-snug text-slate-900 line-clamp-2 dark:text-white'>
                        {post.title}
                      </h3>
                      <p className='text-xs text-slate-500'>
                        {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        </section>

        <section>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-[0.2em] text-primary'>Sélection de la rédaction</p>
              <h2 className='text-2xl font-bold text-primary'>Les incontournables du jour</h2>
              <p className='text-slate-600 dark:text-slate-300'>Une sélection équilibrée entre les rubriques phares.</p>
            </div>
            <Link to={featuredUrl} className={baseLinkClass}>Voir les incontournables du jour</Link>
          </div>
          <div className='mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {loading && Array.from({ length: 6 }).map((_, index) => <PostCardSkeleton key={`grid-${index}`} />)}
            {error && !loading && (
              <p className='col-span-full rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-100 dark:ring-red-800'>
                {error}
              </p>
            )}
            {!loading && !error && featuredPosts.length === 0 && (
              <p className='col-span-full rounded-xl border border-dashed border-subtle bg-subtle/30 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200'>
                Aucun post trouvé pour cette catégorie.
              </p>
            )}
            {!loading && !error && featuredPosts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        </section>

        <section className='space-y-8'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-primary'>Par rubrique</h2>
            <Link to={allRubriquesUrl} className={baseLinkClass}>Voir toutes les rubriques</Link>
          </div>
          <div className='grid gap-8'>
            {trustMediaRubrics.map((category) => {
              const items = sectionPosts[category.slug] || [];
              return (
                <div key={category.slug} className='rounded-3xl border border-subtle bg-white p-5 shadow-subtle dark:border-slate-800 dark:bg-slate-900'>
                  <div className='flex flex-wrap items-center justify-between gap-3 pb-4'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[0.2em] text-primary'>Rubrique</p>
                      <h3 className='text-xl font-bold text-primary'>{category.label}</h3>
                    </div>
                    <Link to={buildSearchUrl({ subCategory: category.slug })} className={baseLinkClass}>
                      Voir {category.label.toLowerCase()}
                    </Link>
                  </div>
                  <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {loading && Array.from({ length: 3 }).map((_, index) => (
                      <PostCardSkeleton key={`${category.slug}-skel-${index}`} />
                    ))}
                    {error && !loading && (
                      <p className='col-span-full text-sm text-red-600 dark:text-red-200'>
                        {error}
                      </p>
                    )}
                    {!loading && !error && items.length === 0 && (
                      <p className='col-span-full text-sm text-slate-500 dark:text-slate-300'>
                        Aucun article pour cette rubrique.
                      </p>
                    )}
                    {!loading && !error && items.map((post) => <PostCard key={post._id} post={post} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </PageContainer>

      <div className='mt-4 bg-gradient-to-r from-secondary/10 via-accent/10 to-ocean/10 py-10'>
        <PageContainer className='flex flex-col items-center justify-center gap-6 text-center'>
          <CallToAction />
        </PageContainer>
      </div>
    </main>
  );
}
